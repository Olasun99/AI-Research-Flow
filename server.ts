import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { PubMedProvider, CrossrefProvider, OpenAlexProvider } from "./server/providers";
import { extractClaims, verifyClaimAgainstSource } from "./server/verification";
import { v4 as uuidv4 } from "uuid";

const pubMed = new PubMedProvider();
const crossref = new CrossrefProvider();
const openAlex = new OpenAlexProvider();

import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { verifyReference, formatCitations, searchRelatedArticles } from "./server/citation-engine";

const upload = multer({ dest: "uploads/" });

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const PORT = 3000;

  // Claim Verification Endpoint
  app.post("/api/claims/verify", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      // 1. Extract Claims
      const claims = await extractClaims(text);
      if (claims.length === 0) {
         return res.json({ results: [] });
      }

      const results = [];
      
      // 2. Process each claim
      for (const claim of claims) {
         // Search all providers in parallel
         const [pubmedSources, crossrefSources, openalexSources] = await Promise.all([
             pubMed.search(claim, 2),
             crossref.search(claim, 2),
             openAlex.search(claim, 2)
         ]);
         
         const allSources = [...pubmedSources, ...crossrefSources, ...openalexSources]
            .filter(s => s.abstract && s.abstract.length > 50); // Prioritize sources with abstracts for verification

         if (allSources.length === 0) {
            results.push({
               claim,
               status: 'UNVERIFIED',
               sources: [],
               message: 'No sources with sufficient abstract found across databases.'
            });
            continue;
         }

         // Verify against the top source with an abstract
         const topSource = allSources[0];
         const evidence = await verifyClaimAgainstSource(claim, topSource);

         results.push({
            claim,
            status: evidence.supportLevel,
            topSource,
            evidence
         });
      }

      res.json({ results });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Claim verification failed" });
    }
  });

  // Security middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite dev server compatibility
    crossOriginEmbedderPolicy: false
  }));
  app.use(cors());
  
  // Rate limiting to prevent abuse
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, default: true },
    message: { error: "Too many requests, please try again later." }
  });

  app.use(express.json({ limit: '10mb' })); // Limit body size

  // Initialize Gemini API
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // --- API Routes ---

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Apply rate limiting to API routes
  app.use("/api/", apiLimiter);

  // Sync incomplete metadata via CrossRef API (or simulated fallback)
  app.post("/api/references/sync", async (req, res) => {
    try {
        const { references } = req.body;
        if (!references || !Array.isArray(references)) {
            return res.status(400).json({ error: "References array is required" });
        }

        const syncedReferences = await Promise.all(references.map(async (ref: any) => {
            if (!ref.isComplete && ref.doi) {
                try {
                    // In a production app, we would make a real request to CrossRef here:
                    // const response = await fetch(`https://api.crossref.org/works/${ref.doi}`);
                    // const data = await response.json();
                    
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    return {
                        ...ref,
                        author: 'Smith, A. et al. (Auto-resolved)',
                        publication: 'Journal of Automated Research',
                        type: 'Journal Article',
                        citations: Math.floor(Math.random() * 100),
                        isComplete: true,
                        title: 'Resolved Title from CrossRef DOI'
                    };
                } catch (e) {
                    console.error("Failed to sync reference", ref.doi, e);
                    return ref;
                }
            }
            return ref;
        }));

        res.json({ references: syncedReferences });
    } catch (error) {
        console.error("Sync error:", error);
        res.status(500).json({ error: "Metadata sync failed" });
    }
  });

  // Analyze a single reference or text chunk
  app.post("/api/references/analyze", async (req, res) => {
    try {
      const { text, targetStyle = "APA 7" } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      
      const prompt = `Analyze this academic reference text: "${text}".
      Identify the source type (Journal Article, Book, etc.) and its current citation style (if possible).
      Extract the metadata: author(s), title, year, journal/publisher, volume, issue, pages, DOI, URL.
      Find and list any errors in formatting, missing fields, or inconsistencies.
      Finally, format this reference correctly in the requested target style: ${targetStyle}.
      Return the result as a JSON object with this exact structure:
      {
        "sourceType": "string",
        "detectedStyle": "string",
        "confidence": "string",
        "metadata": {
          "authors": ["string"],
          "title": "string",
          "year": "string",
          "publication": "string",
          "volume": "string",
          "issue": "string",
          "pages": "string",
          "doi": "string",
          "url": "string"
        },
        "errors": ["string"],
        "formattedReference": "string",
        "explanation": "string"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      let data = response.text;
      if (data) {
          res.json(JSON.parse(data));
      } else {
          res.status(500).json({ error: "Failed to parse reference" });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred during analysis" });
    }
  });

  // Document Processor stub
  app.post("/api/documents/process", upload.single("document"), async (req, res) => {
     try {
         // In a real implementation, we would parse the DOCX/PDF, find references, correct them, and generate a new document.
         // Here we'll return a simulated response.
         setTimeout(() => {
             res.json({
                 id: uuidv4(),
                 status: "completed",
                 fileName: req.file?.originalname || "document.docx",
                 referencesFound: 42,
                 errorsCorrected: 15,
                 message: "Document processed successfully. AI synchronized 42 in-text citations with the bibliography."
             });
         }, 2000);
     } catch (error) {
         console.error(error);
         res.status(500).json({ error: "Document processing failed" });
     }
  });

// Bibliography Manager Routes
app.post("/api/citations/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });
    const results = await searchRelatedArticles(query);
    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

app.post("/api/citations/verify-bulk", async (req, res) => {
  try {
    const { references } = req.body;
    if (!references || !Array.isArray(references)) {
      return res.status(400).json({ error: "References array is required" });
    }

    const results = await Promise.all(references.map(ref => verifyReference(ref)));
    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.post("/api/citations/format-bulk", async (req, res) => {
  try {
    const { metadataList, style } = req.body;
    const formatted = formatCitations(metadataList, style);
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Formatting failed" });
  }
});

  // Assistant Query
  app.post("/api/assistant", async (req, res) => {
    try {
        const { query, context } = req.body;
        
        if (!query) {
          return res.status(400).json({ error: "Query is required" });
        }
        
        const prompt = `You are an AI assistant for an academic reference management platform.
        The user is asking: "${query}".
        Context: ${JSON.stringify(context || {})}
        Provide a helpful, precise, and academic response.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Assistant failed to respond" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
