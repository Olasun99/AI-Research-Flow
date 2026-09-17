import axios from 'axios';
import { NormalizedSource } from '../src/types/schema';

export interface ScholarlyProvider {
    search(query: string, limit?: number): Promise<NormalizedSource[]>;
    verifyMetadata(identifier: string, type: 'doi' | 'pmid' | 'openalex'): Promise<NormalizedSource | null>;
}

export class CrossrefProvider implements ScholarlyProvider {
    private baseUrl = 'https://api.crossref.org/works';

    async search(query: string, limit: number = 5): Promise<NormalizedSource[]> {
        try {
            const searchUrl = `${this.baseUrl}?query=${encodeURIComponent(query)}&rows=${limit}&select=DOI,title,author,container-title,published,abstract,URL,type`;
            const res = await axios.get(searchUrl, {
                headers: { 'User-Agent': 'EvidenceCite/1.0 (mailto:admin@example.com)' }
            });
            const items = res.data.message?.items || [];
            return items.map((item: any) => this.normalize(item));
        } catch (error) {
            console.error("CrossrefProvider search error:", error);
            return [];
        }
    }

    async verifyMetadata(identifier: string, type: 'doi' | 'pmid' | 'openalex'): Promise<NormalizedSource | null> {
        if (type !== 'doi') return null;
        try {
            const res = await axios.get(`${this.baseUrl}/${encodeURIComponent(identifier)}`, {
                headers: { 'User-Agent': 'EvidenceCite/1.0 (mailto:admin@example.com)' }
            });
            const item = res.data.message;
            if (item) return this.normalize(item);
            return null;
        } catch (e) {
            return null;
        }
    }

    private normalize(item: any): NormalizedSource {
        const authors = item.author ? item.author.map((a: any) => `${a.family}, ${a.given}`).join('; ') : 'Unknown';
        let year = '';
        if (item.published && item.published['date-parts'] && item.published['date-parts'][0]) {
            year = item.published['date-parts'][0][0]?.toString() || '';
        }
        
        return {
            canonicalId: `doi:${item.DOI}`,
            title: item.title ? item.title[0] : '',
            authors: authors,
            journal: item['container-title'] ? item['container-title'][0] : '',
            year: year,
            doi: item.DOI,
            pmid: '',
            pmcid: '',
            url: item.URL || `https://doi.org/${item.DOI}`,
            abstract: item.abstract || '',
            sourceDatabase: 'Crossref',
            retrievedAt: new Date().toISOString()
        };
    }
}

export class OpenAlexProvider implements ScholarlyProvider {
    private baseUrl = 'https://api.openalex.org/works';

    async search(query: string, limit: number = 5): Promise<NormalizedSource[]> {
        try {
            const searchUrl = `${this.baseUrl}?search=${encodeURIComponent(query)}&per-page=${limit}`;
            const res = await axios.get(searchUrl, {
                headers: { 'User-Agent': 'EvidenceCite/1.0 (mailto:admin@example.com)' }
            });
            const items = res.data.results || [];
            return items.map((item: any) => this.normalize(item));
        } catch (error) {
            console.error("OpenAlexProvider search error:", error);
            return [];
        }
    }

    async verifyMetadata(identifier: string, type: 'doi' | 'pmid' | 'openalex'): Promise<NormalizedSource | null> {
        if (type !== 'openalex' && type !== 'doi') return null;
        try {
            const urlId = type === 'doi' ? `doi:${identifier}` : identifier;
            const res = await axios.get(`${this.baseUrl}/${encodeURIComponent(urlId)}`, {
                headers: { 'User-Agent': 'EvidenceCite/1.0 (mailto:admin@example.com)' }
            });
            const item = res.data;
            if (item) return this.normalize(item);
            return null;
        } catch (e) {
            return null;
        }
    }

    private normalize(item: any): NormalizedSource {
        const authors = item.authorships ? item.authorships.map((a: any) => a.author.display_name).join('; ') : 'Unknown';
        const id = item.id ? item.id.replace('https://openalex.org/', '') : '';
        const doi = item.doi ? item.doi.replace('https://doi.org/', '') : '';
        
        return {
            canonicalId: `openalex:${id}`,
            title: item.title || '',
            authors: authors,
            journal: item.primary_location?.source?.display_name || '',
            year: item.publication_year?.toString() || '',
            doi: doi,
            pmid: item.ids?.pmid ? item.ids.pmid.replace('https://pubmed.ncbi.nlm.nih.gov/', '') : '',
            pmcid: item.ids?.pmcid || '',
            url: item.doi || item.id || '',
            abstract: '', // OpenAlex provides inverted abstract, requires reassembly. Leaving empty for brevity unless full evidence retrieval needed.
            sourceDatabase: 'OpenAlex',
            retrievedAt: new Date().toISOString()
        };
    }
}

export class PubMedProvider implements ScholarlyProvider {
    private baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

    async search(query: string, limit: number = 5): Promise<NormalizedSource[]> {
        try {
            // 1. Search for IDs
            const searchUrl = `${this.baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=${limit}`;
            const searchRes = await axios.get(searchUrl);
            const ids = searchRes.data.esearchresult?.idlist || [];

            if (ids.length === 0) return [];

            // 2. Fetch Summaries
            const summaryUrl = `${this.baseUrl}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
            const summaryRes = await axios.get(summaryUrl);
            const results = summaryRes.data.result;

            const sources: NormalizedSource[] = [];
            for (const id of ids) {
                if (results[id]) {
                    sources.push(this.normalize(results[id], id));
                }
            }
            return sources;
        } catch (error) {
            console.error("PubMedProvider search error:", error);
            return []; // Fail gracefully for now, proper error handling can be expanded
        }
    }

    async verifyMetadata(identifier: string, type: 'pmid'): Promise<NormalizedSource | null> {
        if (type !== 'pmid') return null;
        try {
            const summaryUrl = `${this.baseUrl}/esummary.fcgi?db=pubmed&id=${identifier}&retmode=json`;
            const summaryRes = await axios.get(summaryUrl);
            const result = summaryRes.data.result?.[identifier];
            if (result) return this.normalize(result, identifier);
            return null;
        } catch (e) {
            return null;
        }
    }

    private normalize(item: any, pmid: string): NormalizedSource {
        let doi = '';
        if (item.articleids) {
            const doiObj = item.articleids.find((idObj: any) => idObj.idtype === 'doi');
            if (doiObj) doi = doiObj.value;
        }

        return {
            canonicalId: `pmid:${pmid}`,
            title: item.title || '',
            authors: item.authors ? item.authors.map((a: any) => a.name).join('; ') : 'Unknown',
            journal: item.fulljournalname || item.source || '',
            year: item.pubdate ? item.pubdate.substring(0, 4) : '',
            doi: doi,
            pmid: pmid,
            pmcid: '', // Could be extracted if needed
            url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
            abstract: '', // Require efetch for full abstract, omitted here for brevity unless explicitly requested
            sourceDatabase: 'PubMed',
            retrievedAt: new Date().toISOString()
        };
    }
}
