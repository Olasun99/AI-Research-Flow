export type CitationStyle = 
  | "APA 7" 
  | "APA 6" 
  | "MLA" 
  | "Chicago" 
  | "Turabian" 
  | "Harvard" 
  | "Vancouver" 
  | "AMA" 
  | "NLM" 
  | "IEEE";

export type ReferenceType = 
  | "Journal Article" 
  | "Book" 
  | "Book Chapter" 
  | "Conference Paper" 
  | "Dissertation" 
  | "Webpage" 
  | "Unknown";

export interface ReferenceMetadata {
  authors: string[];
  title: string;
  year: string;
  publication: string;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  url: string;
}

export interface AnalyzedReference {
  id: string;
  originalText: string;
  sourceType: ReferenceType;
  detectedStyle: string;
  confidence: string;
  metadata: ReferenceMetadata;
  errors: string[];
  formattedReference: string;
  explanation: string;
  status: "pending" | "analyzing" | "success" | "error";
}

export interface DocumentAnalysisResult {
    id: string;
    fileName: string;
    referencesFound: number;
    errorsCorrected: number;
    message: string;
    status: "completed" | "processing" | "failed";
}
