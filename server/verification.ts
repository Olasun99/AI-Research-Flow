import { GoogleGenAI } from "@google/genai";
import { ClaimRecord, EvidenceRecord, NormalizedSource } from "../src/types/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractClaims(text: string): Promise<string[]> {
    const prompt = `Extract all atomic factual claims from the following text. Return a pure JSON array of strings. Text: "${text}"`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        const parsed = JSON.parse(response.text || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to extract claims", e);
        return [text]; // Fallback to original text
    }
}

export async function verifyClaimAgainstSource(claim: string, source: NormalizedSource): Promise<EvidenceRecord> {
    const prompt = `
    Analyze the following claim against the provided scholarly source metadata and abstract.
    
    CLAIM: "${claim}"
    SOURCE TITLE: "${source.title}"
    SOURCE AUTHORS: "${source.authors}"
    SOURCE ABSTRACT/SNIPPET: "${source.abstract || source.title}"
    
    Determine the support level for this claim based strictly on the source provided. 
    Select ONE of the following support levels: SUPPORTED, PARTIALLY_SUPPORTED, INDIRECTLY_SUPPORTED, CONTRADICTED, INSUFFICIENT, UNVERIFIED.
    
    Provide a concise reasoning string and quote the exact evidence snippet.
    
    Respond in strict JSON format:
    {
       "supportLevel": "SUPPORTED" | "PARTIALLY_SUPPORTED" | "INDIRECTLY_SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT" | "UNVERIFIED",
       "reasoning": "string",
       "evidenceLocation": "string (the exact quote from abstract if available)",
       "contradictoryEvidence": "string (optional, if contradiction exists)"
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const data = JSON.parse(response.text || '{}');
        return {
            id: Math.random().toString(),
            claimId: claim,
            sourceId: source.canonicalId,
            supportLevel: data.supportLevel || 'UNVERIFIED',
            reasoning: data.reasoning || 'Parsing failed',
            evidenceLocation: data.evidenceLocation || ''
        };
    } catch (e) {
        console.error("Verification failed", e);
        return {
            id: Math.random().toString(),
            claimId: claim,
            sourceId: source.canonicalId,
            supportLevel: 'API_ERROR' as any,
            reasoning: 'API Error',
            evidenceLocation: ''
        };
    }
}
