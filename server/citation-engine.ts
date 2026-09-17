import axios from 'axios';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-doi';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-ris';

export async function searchRelatedArticles(query: string, limit: number = 5) {
    try {
        const encodedQuery = encodeURIComponent(query.substring(0, 300)); // Limit length to prevent URL too long
        const openAlexRes = await axios.get(`https://api.openalex.org/works?search=${encodedQuery}&per-page=${limit}`);
        
        if (openAlexRes.data.results && openAlexRes.data.results.length > 0) {
             return openAlexRes.data.results.map((work: any) => formatOpenAlexData(work, query, 'OpenAlex'));
        }
        return [];
    } catch (e) {
        console.error('Search error:', e);
        return [];
    }
}

export async function verifyReference(refString: string) {
    try {
        // Simple extraction for DOI, PMID
        const doiMatch = refString.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
        if (doiMatch) {
            const doi = doiMatch[0];
            const response = await axios.get(`https://api.crossref.org/works/${doi}`);
            return formatCrossrefData(response.data.message, refString, 'Crossref');
        }

        // Try OpenAlex text search
        const query = encodeURIComponent(refString.substring(0, 150)); // Search first 150 chars
        const openAlexRes = await axios.get(`https://api.openalex.org/works?search=${query}&per-page=1`);
        
        if (openAlexRes.data.results && openAlexRes.data.results.length > 0) {
             const bestMatch = openAlexRes.data.results[0];
             return formatOpenAlexData(bestMatch, refString, 'OpenAlex');
        }

        return {
            originalText: refString,
            status: 'Unverified',
            source: 'None',
            metadata: null
        };
    } catch (e) {
        console.error('Verification error:', e);
        return {
            originalText: refString,
            status: 'Error',
            source: 'None',
            metadata: null
        };
    }
}

function formatCrossrefData(work: any, original: string, source: string) {
    const authors = work.author ? work.author.map((a: any) => `${a.family}, ${a.given}`).join('; ') : 'Unknown';
    const year = work.issued && work.issued['date-parts'] ? work.issued['date-parts'][0][0] : '';
    const title = work.title ? work.title[0] : '';
    const journal = work['container-title'] ? work['container-title'][0] : '';
    
    return {
        originalText: original,
        status: 'Verified',
        source,
        metadata: {
            id: work.DOI || Math.random().toString(),
            title,
            authors,
            year: year.toString(),
            journal,
            doi: work.DOI,
            type: work.type || 'journal-article'
        }
    };
}

function formatOpenAlexData(work: any, original: string, source: string) {
    const authors = work.authorships ? work.authorships.map((a: any) => a.author.display_name).join('; ') : 'Unknown';
    return {
        originalText: original,
        status: 'Verified',
        source,
        metadata: {
             id: work.id.replace('https://openalex.org/', ''),
             title: work.title,
             authors,
             year: work.publication_year?.toString() || '',
             journal: work.primary_location?.source?.display_name || '',
             doi: work.doi ? work.doi.replace('https://doi.org/', '') : '',
             type: work.type || 'journal-article'
        }
    };
}

export function formatCitations(metadataList: any[], style: string) {
    try {
        const cslData = metadataList.map(meta => {
            return {
                id: meta.id,
                type: 'article-journal', // Default fallback
                title: meta.title,
                author: meta.authors.split('; ').map((a: string) => {
                    const parts = a.split(', ');
                    return { family: parts[0], given: parts[1] || '' };
                }),
                issued: { 'date-parts': [[parseInt(meta.year)]] },
                'container-title': meta.journal,
                DOI: meta.doi
            };
        });

        const cite = new Cite(cslData);
        
        let cslStyle = 'apa';
        if (style.toLowerCase().includes('mla')) cslStyle = 'mla';
        if (style.toLowerCase().includes('chicago')) cslStyle = 'chicago-author-date';
        if (style.toLowerCase().includes('vancouver')) cslStyle = 'vancouver';
        if (style.toLowerCase().includes('harvard')) cslStyle = 'harvard1';
        if (style.toLowerCase().includes('ieee')) cslStyle = 'ieee';

        if (style === 'bibtex') {
             return cite.format('bibtex');
        }
        if (style === 'ris') {
             return cite.format('ris');
        }

        const bibliography = cite.format('bibliography', {
            format: 'text',
            template: cslStyle,
            lang: 'en-US'
        });

        // Generate in-text citations mapping (very basic representation)
        const inTextMap = cslData.map(item => {
             const singleCite = new Cite([item]);
             const inText = singleCite.format('citation', {
                 format: 'text',
                 template: cslStyle,
                 lang: 'en-US'
             });
             return { id: item.id, inText: inText.trim() };
        });

        return { bibliography, inTextMap, rawCsl: cslData };
    } catch (e) {
        console.error('Formatting error:', e);
        throw e;
    }
}
