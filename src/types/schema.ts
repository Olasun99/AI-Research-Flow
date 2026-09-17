export interface DocumentRecord {
    id: string;
    title: string;
    content: string;
    importedAt: string;
}

export interface ParagraphRecord {
    id: string;
    documentId: string;
    content: string;
    index: number;
}

export interface ClaimRecord {
    id: string;
    paragraphId: string;
    documentId: string;
    text: string;
    type: 'factual' | 'numerical' | 'causal' | 'association' | 'mechanistic' | 'clinical' | 'methodological' | 'definition' | 'hypothesis' | 'unknown';
}

export interface NormalizedSource {
    canonicalId: string;
    title: string;
    authors: string;
    journal: string;
    publicationDate?: string;
    year: string;
    doi: string;
    pmid: string;
    pmcid: string;
    url: string;
    abstract: string;
    sourceDatabase: string;
    retrievedAt: string;
}

export interface EvidenceRecord {
    id: string;
    claimId: string;
    sourceId: string;
    supportLevel: 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'INDIRECTLY_SUPPORTED' | 'CONTRADICTED' | 'INSUFFICIENT' | 'UNVERIFIED';
    reasoning: string;
    evidenceLocation: string; // snippet from abstract/text
    contradictoryEvidence?: string;
}

export interface VerificationResult {
    id: string;
    claimId: string;
    status: 'VERIFIED' | 'METADATA_VERIFIED' | 'PARTIALLY_SUPPORTED' | 'INDIRECTLY_SUPPORTED' | 'CONTRADICTED' | 'UNVERIFIED' | 'IDENTIFIER_MISMATCH' | 'API_ERROR';
    evidenceIds: string[];
}

export interface CitationRecord {
    id: string;
    claimId: string;
    sourceId: string;
    format: string; // e.g., 'APA'
    insertedText: string;
    approvedAt: string;
}
