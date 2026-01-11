// import type { Express } from "express";
// import { z } from "zod";
// import { storage } from "./storage";
// import { db } from "./db";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { extractTextFromFile, getFileType, type FileType } from "./textExtraction";
// import { api } from "../shared/routes";
// import { prompts, insertPromptSchema, refinedOutputSchema, refineInputSchema } from "../shared/schema";
// import { eq } from "drizzle-orm";

// // Fallback analysis function for when AI fails
// function analyzeInputFallback(input: string): {
//   primaryIntent: string;
//   functionalExpectations: string[];
//   technicalConstraints: string[];
//   expectedOutputs: string[];
//   ambiguities: string[];
//   missingInformation: string[];
//   confidenceScore: number;
// } {
//   const lowerInput = input.toLowerCase();

//   // Basic keyword analysis
//   const keywords = {
//     create: lowerInput.includes('create') || lowerInput.includes('build') || lowerInput.includes('make'),
//     app: lowerInput.includes('app') || lowerInput.includes('application') || lowerInput.includes('website'),
//     todo: lowerInput.includes('todo') || lowerInput.includes('task') || lowerInput.includes('list'),
//     react: lowerInput.includes('react') || lowerInput.includes('vue') || lowerInput.includes('angular'),
//     api: lowerInput.includes('api') || lowerInput.includes('backend') || lowerInput.includes('server'),
//     database: lowerInput.includes('database') || lowerInput.includes('db') || lowerInput.includes('data'),
//     login: lowerInput.includes('login') || lowerInput.includes('auth') || lowerInput.includes('authentication'),
//     user: lowerInput.includes('user') || lowerInput.includes('account') || lowerInput.includes('profile'),
//   };

//   let primaryIntent = "Create a software application";
//   let functionalExpectations: string[] = [];
//   let technicalConstraints: string[] = [];
//   let expectedOutputs: string[] = [];
//   let ambiguities: string[] = [];
//   let missingInformation: string[] = [];
//   let confidenceScore = 0.6;

//   if (keywords.create && keywords.app) {
//     primaryIntent = "Develop a software application";
//     functionalExpectations = ["Implement core functionality", "Create user interface"];
//     expectedOutputs = ["Working application", "User-friendly interface"];

//     if (keywords.todo) {
//       primaryIntent = "Build a task management application";
//       functionalExpectations = ["Add tasks", "Mark tasks complete", "Delete tasks", "View task list"];
//       expectedOutputs = ["Functional todo list", "Task completion tracking"];
//       technicalConstraints = ["Web-based application"];
//       ambiguities = ["Specific UI design not specified"];
//       missingInformation = ["Persistence requirements", "Multi-user support"];
//       confidenceScore = 0.85;
//     } else if (keywords.api) {
//       primaryIntent = "Build a backend API service";
//       functionalExpectations = ["Provide API endpoints", "Handle data processing", "Return structured responses"];
//       expectedOutputs = ["RESTful API", "Documentation"];
//       technicalConstraints = ["Backend framework implementation"];
//       ambiguities = ["Specific endpoints not detailed"];
//       missingInformation = ["Data models", "Authentication method"];
//       confidenceScore = 0.8;
//     } else if (keywords.login) {
//       primaryIntent = "Implement user authentication system";
//       functionalExpectations = ["User registration", "Login functionality", "Session management"];
//       expectedOutputs = ["Secure authentication", "User sessions"];
//       technicalConstraints = ["Security best practices"];
//       ambiguities = ["Authentication method not specified"];
//       missingInformation = ["User data storage", "Password policies"];
//       confidenceScore = 0.8;
//     } else {
//       // Generic app creation
//       functionalExpectations = ["Implement core features", "Create user interface", "Handle user interactions"];
//       expectedOutputs = ["Functional application"];
//       technicalConstraints = ["Modern web technologies"];
//       ambiguities = ["Specific features not detailed"];
//       missingInformation = ["Target platform", "Design requirements", "Functionality scope"];
//       confidenceScore = 0.7;
//     }

//     if (keywords.react) {
//       technicalConstraints.push("Frontend framework: React");
//     }

//     if (keywords.database) {
//       technicalConstraints.push("Database integration required");
//       functionalExpectations.push("Data persistence and retrieval");
//     }

//     if (keywords.user) {
//       functionalExpectations.push("User management features");
//     }

//   } else if (input.trim().length > 0) {
//     // Try to extract some meaning from non-standard inputs
//     primaryIntent = "Process user requirements";
//     functionalExpectations = ["Analyze input requirements"];
//     expectedOutputs = ["Structured requirements analysis"];
//     ambiguities = ["Requirements not clearly specified"];
//     missingInformation = ["Specific goals and constraints"];
//     confidenceScore = 0.5;
//   } else {
//     ambiguities = ["No clear requirements provided"];
//     missingInformation = ["User input required"];
//     confidenceScore = 0.3;
//   }

//   return {
//     primaryIntent,
//     functionalExpectations,
//     technicalConstraints,
//     expectedOutputs,
//     ambiguities,
//     missingInformation,
//     confidenceScore,
//   };
// }

// const HF_MODEL =
//   "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

// async function refineWithHuggingFace(prompt: string) {
//   console.log('Calling Hugging Face API with input:', prompt);

//   const apiKey = process.env.HUGGINGFACE_API_KEY;
//   if (!apiKey) {
//     throw new Error('Hugging Face API key not configured');
//   }

//   const response = await fetch(HF_MODEL, {
//     method: "POST",
//     headers: {
//       "Authorization": `Bearer ${apiKey}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       inputs: `Analyze this user requirement and provide a structured breakdown. You must respond with ONLY a valid JSON object in this exact format:

// {
//   "primaryIntent": "Brief description of the main goal",
//   "functionalExpectations": ["Specific features the system should have"],
//   "technicalConstraints": ["Technical requirements or limitations"],
//   "expectedOutputs": ["What the final product should deliver"],
//   "ambiguities": ["Unclear or unspecified aspects"],
//   "missingInformation": ["Information that would be helpful to know"],
//   "confidenceScore": 0.8
// }

// IMPORTANT:
// - Analyze the specific user input below
// - Make the analysis relevant to the actual content of the input
// - Do not use generic responses
// - Be specific to the domain and requirements mentioned
// - Return ONLY the JSON object, no other text

// User Input: "${prompt}"

// JSON Response:`,
//       parameters: {
//         max_new_tokens: 1024,
//         temperature: 0.3,
//         do_sample: true,
//         top_p: 0.95,
//         return_full_text: false,
//       },
//     }),
//   });

//   if (!response.ok) {
//     throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
//   }

//   const result = await response.json();
//   console.log('Hugging Face API response:', JSON.stringify(result, null, 2));

//   // Hugging Face returns array output
//   const text = result[0]?.generated_text;

//   if (!text) {
//     throw new Error('No generated text in Hugging Face response');
//   }

//   // Extract JSON safely - look for the JSON object
//   const jsonMatch = text.match(/\{[\s\S]*\}/);
//   if (!jsonMatch) {
//     throw new Error('No JSON found in Hugging Face response');
//   }

//   let parsed;
//   try {
//     parsed = JSON.parse(jsonMatch[0]);
//   } catch (parseError) {
//     console.error('JSON parse error:', parseError);
//     throw new Error('Invalid JSON in Hugging Face response');
//   }

//   // Validate the structure
//   const requiredFields = ['primaryIntent', 'functionalExpectations', 'technicalConstraints', 'expectedOutputs', 'ambiguities', 'missingInformation', 'confidenceScore'];
//   for (const field of requiredFields) {
//     if (!(field in parsed)) {
//       throw new Error(`Missing required field: ${field}`);
//     }
//   }

//   // Ensure arrays are arrays and confidenceScore is a number
//   if (!Array.isArray(parsed.functionalExpectations) || !Array.isArray(parsed.technicalConstraints) ||
//       !Array.isArray(parsed.expectedOutputs) || !Array.isArray(parsed.ambiguities) || !Array.isArray(parsed.missingInformation)) {
//     throw new Error('Some fields are not arrays as expected');
//   }

//   if (typeof parsed.confidenceScore !== 'number' || parsed.confidenceScore < 0 || parsed.confidenceScore > 1) {
//     parsed.confidenceScore = 0.5; // Default if invalid
//   }

//   return parsed;
// }

// // Configure multer for file uploads
// const upload = multer({
//   dest: 'uploads/',
//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     // Allow various file types
//     const allowedTypes = [
//       'text/plain',
//       'text/markdown',
//       'application/pdf',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'image/jpeg',
//       'image/png',
//       'image/gif',
//       'image/bmp',
//       'video/mp4',
//       'video/avi',
//       'video/quicktime',
//     ];

//     if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(txt|md|pdf|docx|png|jpg|jpeg|gif|bmp|mp4|avi|mov)$/i)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Unsupported file type'));
//     }
//   },
// });

// // Configure multer to parse text fields and file
// const uploadFields = upload.fields([
//   { name: 'input_text', maxCount: 1 },
//   { name: 'file', maxCount: 1 },
//   { name: 'source_type', maxCount: 1 }
// ]);

// export function registerRoutes(httpServer: any, app: Express) {
//   // Ensure uploads directory exists
//   if (!fs.existsSync('uploads')) {
//     fs.mkdirSync('uploads');
//   }

//   // Refine prompt endpoint with file upload support
//   app.post(api.prompts.refine.path, uploadFields, async (req, res) => {
//     try {
//       const inputText = req.body.input_text || '';
//       const sourceType = Array.isArray(req.body.source_type) ? req.body.source_type[0] : req.body.source_type || 'text';
//       let extractedContent = inputText;
//       let fileType: FileType = 'text';
//       let metadata: any = {};

//       // If a file was uploaded, extract text from it
//       if (req.files && (req.files as any).file && (req.files as any).file.length > 0) {
//         const file = (req.files as any).file[0];
//         fileType = getFileType(file.originalname, file.mimetype);
//         extractedContent = await extractTextFromFile(file.path, fileType);
//         metadata = { filename: file.originalname, size: file.size };

//         // Clean up uploaded file after processing
//         fs.unlinkSync(file.path);
//       }

//       // If no content extracted and no input text, return error
//       if (!extractedContent.trim()) {
//         return res.status(400).json({
//           message: "No readable content found. Please provide text input or upload a valid file."
//         });
//       }

//       // Rejection logic for invalid inputs
//       const trimmedContent = extractedContent.trim();
//       const lowerContent = trimmedContent.toLowerCase();

//       // Check for completely irrelevant input (greetings, spam, etc.)
//       const irrelevantPatterns = [
//         /^hi+$/i,
//         /^hello+$/i,
//         /^hey+$/i,
//         /^thanks?$/i,
//         /^thank you$/i,
//         /^bye$/i,
//         /^goodbye$/i,
//         /^ok$/i,
//         /^okay$/i,
//         /^yes$/i,
//         /^no$/i,
//         /^lol$/i,
//         /^haha/i,
//         /^[.!?]+$/  // Only punctuation
//       ];

//       const isIrrelevant = irrelevantPatterns.some(pattern => pattern.test(trimmedContent)) ||
//                           trimmedContent.length < 3 ||
//                           /^(.)\1{10,}$/.test(trimmedContent); // Repeated characters

//       if (isIrrelevant) {
//         return res.status(400).json({
//           message: "Input appears to be irrelevant or too brief. Please provide a clear description of what you want to build or create.",
//           rejectionReason: "irrelevant_input"
//         });
//       }

//       // Check for no detectable intent
//       const intentKeywords = [
//         'create', 'build', 'make', 'develop', 'design', 'implement',
//         'app', 'application', 'website', 'system', 'tool', 'platform',
//         'api', 'backend', 'frontend', 'database', 'function', 'feature',
//         'todo', 'task', 'list', 'manage', 'track', 'store', 'display'
//       ];

//       const hasIntent = intentKeywords.some(keyword => lowerContent.includes(keyword));
//       if (!hasIntent && trimmedContent.split(' ').length < 5) {
//         return res.status(400).json({
//           message: "Unable to detect a clear intent. Please provide more specific requirements about what you want to create or build.",
//           rejectionReason: "no_detectable_intent"
//         });
//       }

//       // Map fileType to schema type
//       let schemaType = sourceType;
//       if (fileType !== 'text') {
//         if (fileType === 'pdf' || fileType === 'docx') {
//           schemaType = 'document';
//         } else {
//           schemaType = fileType;
//         }
//       }

//       // Validate input
//       const input = {
//         content: extractedContent,
//         type: schemaType,
//         metadata,
//       };

//       console.log('Input before validation:', input);
//       console.log('sourceType:', sourceType, 'type of:', typeof sourceType);

//       const validatedInput = refineInputSchema.parse(input);

//       // Use Hugging Face AI for intelligent prompt refinement
//       let refinedOutput;
//       try {
//         refinedOutput = await refineWithHuggingFace(validatedInput.content);
//         console.log('Hugging Face analysis successful');
//       } catch (aiError) {
//         console.error('Hugging Face API failed, falling back to local analysis:', aiError);
//         // Fallback to local analysis if AI fails
//         refinedOutput = analyzeInputFallback(validatedInput.content);
//       }

//       // Validate the refined output
//       const validatedRefinedOutput = refinedOutputSchema.parse(refinedOutput);

//       // Save to database
//       const promptRecord = await db.insert(prompts).values({
//         originalInput: validatedInput.content,
//         inputType: validatedInput.type,
//         refinedPrompt: JSON.stringify(refinedOutput),
//         confidenceScore: refinedOutput.confidenceScore,
//         metadata: JSON.stringify(validatedInput.metadata),
//       }).returning();

//       res.status(201).json(promptRecord[0]);
//     } catch (error) {
//       console.error('Error in refine endpoint:', error);

//       if (error instanceof z.ZodError) {
//         res.status(400).json({ message: "Invalid input", field: error.errors[0]?.path?.join('.') });
//       } else {
//         res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
//       }
//     }
//   });

//   // List prompts endpoint
//   app.get(api.prompts.list.path, async (req, res) => {
//     try {
//       const allPrompts = await db.select().from(prompts).orderBy(prompts.createdAt);
//       const parsedPrompts = allPrompts.map(prompt => ({
//         ...prompt,
//         refinedPrompt: JSON.parse(prompt.refinedPrompt),
//         metadata: prompt.metadata ? JSON.parse(prompt.metadata) : null,
//       }));
//       res.json(parsedPrompts);
//     } catch (error) {
//       console.error('Error listing prompts:', error);
//       res.status(500).json({ message: "Failed to list prompts" });
//     }
//   });

//   // Get prompt by ID endpoint
//   app.get(api.prompts.get.path, async (req, res) => {
//     try {
//       const id = parseInt(req.params.id);
//       const prompt = await db.select().from(prompts).where(eq(prompts.id, id)).limit(1);

//       if (!prompt.length) {
//         res.status(404).json({ message: "Prompt not found" });
//       } else {
//         const parsedPrompt = {
//           ...prompt[0],
//           refinedPrompt: JSON.parse(prompt[0].refinedPrompt),
//           metadata: prompt[0].metadata ? JSON.parse(prompt[0].metadata) : null,
//         };
//         res.json(parsedPrompt);
//       }
//     } catch (error) {
//       console.error('Error getting prompt:', error);
//       res.status(500).json({ message: "Failed to get prompt" });
//     }
//   });
// }

import type { Express } from "express";
import { z } from "zod";
import { db } from "./db";
import multer from "multer";
import fs from "fs";
import { extractTextFromFile, getFileType, type FileType } from "./textExtraction";
import { api } from "../shared/routes";
import { prompts, refinedOutputSchema, refineInputSchema } from "../shared/schema";
import { eq } from "drizzle-orm";

/* ======================================================
   SMART FALLBACK (TEXT + FILE AWARE)
====================================================== */
function analyzeInputFallback(input: string, isFileUpload: boolean = false) {
  console.log('analyzeInputFallback called with isFileUpload:', isFileUpload, 'input length:', input.length);
  const text = input.toLowerCase();

  // FILE UPLOAD FALLBACK - Always trigger for file uploads
  if (isFileUpload || text.includes("uploaded a file")) {
    console.log('File upload detected, returning document analysis');
    return {
      primaryIntent: "Analyze uploaded document",
      functionalExpectations: [
        "Extract key requirements from document",
        "Summarize objectives",
        "Identify functional needs",
      ],
      technicalConstraints: [
        "Dependent on document quality",
        "Text extraction limitations",
      ],
      expectedOutputs: [
        "Structured summary of document requirements",
      ],
      ambiguities: [
        "Document structure unclear",
      ],
      missingInformation: [
        "Explicit goals",
        "Target users",
      ],
      confidenceScore: 0.6,
    };
  }

  // DOCUMENT ANALYSIS (text-based request)
  if (
    (text.includes("analyze") || text.includes("analysis")) && 
    (text.includes("document") || text.includes("file"))
  ) {
    console.log('Document analysis request detected');
    return {
      primaryIntent: "Perform document analysis and information extraction",
      functionalExpectations: [
        "Parse and understand document content",
        "Extract structured information from documents",
        "Identify key data points and requirements",
        "Generate summary of findings",
      ],
      technicalConstraints: [
        "Requires document upload capability",
        "Text extraction and NLP processing",
        "Support for multiple document formats",
      ],
      expectedOutputs: [
        "Detailed document analysis report",
        "Extracted key information in structured format",
        "Summary of main points",
      ],
      ambiguities: [
        "Type of document not specified",
        "Level of analysis detail unclear",
      ],
      missingInformation: [
        "Actual document to analyze",
        "Specific information to extract",
        "Preferred output format",
      ],
      confidenceScore: 0.7,
    };
  }

  // E-COMMERCE - Check first to prioritize over other patterns
  if (text.includes("store") || text.includes("ecommerce") || text.includes("e-commerce") || text.includes("shop") || text.includes("commerce")) {
    return {
      primaryIntent: "Develop an e-commerce platform",
      functionalExpectations: [
        "Browse products",
        "Add to cart",
        "Checkout with payments",
      ],
      technicalConstraints: ["Secure payment gateway"],
      expectedOutputs: ["Online shopping platform"],
      ambiguities: ["Shipping flow not defined"],
      missingInformation: ["Payment provider"],
      confidenceScore: 0.9,
    };
  }

  // FITNESS
  if (text.includes("fitness") || text.includes("workout")) {
    return {
      primaryIntent: "Build a fitness tracking mobile application",
      functionalExpectations: [
        "Track workouts",
        "Monitor fitness progress",
        "Store health data",
      ],
      technicalConstraints: ["Mobile-first design"],
      expectedOutputs: ["Fitness tracking application"],
      ambiguities: [],
      missingInformation: ["Target platform"],
      confidenceScore: 0.85,
    };
  }

  // TODO
  if (text.includes("todo") || text.includes("task")) {
    return {
      primaryIntent: "Create a task management application",
      functionalExpectations: [
        "Add tasks",
        "Mark tasks complete",
        "View task list",
      ],
      technicalConstraints: ["Web-based application"],
      expectedOutputs: ["Todo list application"],
      ambiguities: [],
      missingInformation: ["User authentication"],
      confidenceScore: 0.8,
    };
  }

  // DEFAULT
  return {
    primaryIntent: "Build a custom software solution",
    functionalExpectations: ["Analyze and implement requirements"],
    technicalConstraints: [],
    expectedOutputs: ["Working application"],
    ambiguities: ["Requirements are high-level"],
    missingInformation: ["Detailed feature list"],
    confidenceScore: 0.6,
  };
}

/* ======================================================
   GOOGLE GEMINI INTEGRATION
====================================================== */
import { GoogleGenerativeAI } from "@google/generative-ai";

async function refineWithGemini(prompt: string) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("Google AI key missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(`
Analyze the USER INPUT and return SPECIFIC analysis for prompt refinement.
Return ONLY valid JSON with these exact fields:

{
  "primaryIntent": "Brief description of the main goal",
  "functionalExpectations": ["Specific features the system should have"],
  "technicalConstraints": ["Technical requirements or limitations"],
  "expectedOutputs": ["What the final product should deliver"],
  "ambiguities": ["Unclear or unspecified aspects"],
  "missingInformation": ["Information that would be helpful to know"],
  "confidenceScore": 0.8
}

IMPORTANT:
- Analyze the specific user input below
- Make the analysis relevant to the actual content of the input
- Do not use generic responses
- Be specific to the domain and requirements mentioned
- Return ONLY the JSON object, no other text or explanation

USER INPUT:
${prompt}

JSON Response:
  `);

  const response = await result.response;
  const text = response.text();

  if (!text) throw new Error("No Gemini output");

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Invalid JSON in Gemini response");

  const parsed = JSON.parse(match[0]);

  // Validate required fields
  const requiredFields = ['primaryIntent', 'functionalExpectations', 'technicalConstraints', 'expectedOutputs', 'ambiguities', 'missingInformation', 'confidenceScore'];
  for (const field of requiredFields) {
    if (!(field in parsed)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Ensure arrays are arrays and confidenceScore is a number
  if (!Array.isArray(parsed.functionalExpectations) || !Array.isArray(parsed.technicalConstraints) ||
      !Array.isArray(parsed.expectedOutputs) || !Array.isArray(parsed.ambiguities) || !Array.isArray(parsed.missingInformation)) {
    throw new Error('Some fields are not arrays as expected');
  }

  if (typeof parsed.confidenceScore !== 'number' || parsed.confidenceScore < 0 || parsed.confidenceScore > 1) {
    parsed.confidenceScore = 0.5; // Default if invalid
  }

  // Reject generic AI output
  if (
    parsed.primaryIntent?.toLowerCase().includes("process user requirements") ||
    parsed.functionalExpectations?.length <= 1
  ) {
    throw new Error("Generic AI output");
  }

  return parsed;
}

/* ======================================================
   MULTER CONFIG
====================================================== */
const upload = multer({ dest: "uploads/" });
const uploadFields = upload.fields([
  { name: "input_text", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "source_type", maxCount: 1 },
]);

/* ======================================================
   ROUTES
====================================================== */
export function registerRoutes(_: any, app: Express) {
  if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

  app.post(api.prompts.refine.path, uploadFields, async (req, res) => {
    try {
      const inputText = req.body.input_text || "";
      let extractedContent = inputText;
      let metadata: any = {};

      const isFileUpload = !!(req.files && (req.files as any).file);

      // FILE HANDLING
      if (isFileUpload) {
        const file = (req.files as any).file[0];
        const fileType = getFileType(file.originalname, file.mimetype);
        extractedContent = await extractTextFromFile(file.path, fileType);
        metadata = { filename: file.originalname, fileType };
        fs.unlinkSync(file.path);

        // IMPORTANT FIX: never block pipeline
        if (!extractedContent.trim()) {
          extractedContent =
            "User uploaded a file. Extracted content is limited or unavailable.";
        } else {
          // Prepend file upload indicator for successful extractions
          extractedContent = `User uploaded a file: ${extractedContent}`;
        }
      }

      const validatedInput = refineInputSchema.parse({
        content: extractedContent,
        type: "text",
        metadata,
      });

      let refinedOutput;
      
      // Check if input mentions document analysis (even without file upload)
      const text = validatedInput.content.toLowerCase();
      const isDocumentAnalysisRequest = 
        (text.includes("analyze") || text.includes("analysis")) && 
        (text.includes("document") || text.includes("file"));
      
      // For file uploads OR document analysis requests, use fallback analysis
      if (isFileUpload || isDocumentAnalysisRequest) {
        console.log('Using fallback for file upload or document analysis request');
        refinedOutput = analyzeInputFallback(validatedInput.content, isFileUpload);
      } else {
        try {
          console.log('Using Gemini for text input');
          refinedOutput = await refineWithGemini(validatedInput.content);
        } catch (error) {
          console.log('Gemini failed, using fallback:', error.message);
          refinedOutput = analyzeInputFallback(validatedInput.content, false);
        }
      }

      refinedOutputSchema.parse(refinedOutput);

      const record = await db
        .insert(prompts)
        .values({
          originalInput: validatedInput.content,
          inputType: validatedInput.type,
          refinedPrompt: JSON.stringify(refinedOutput),
          confidenceScore: refinedOutput.confidenceScore,
          metadata: JSON.stringify(metadata),
        })
        .returning();

      res.status(201).json(record[0]);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.prompts.list.path, async (_, res) => {
    const data = await db.select().from(prompts);
    res.json(
      data.map((p) => ({
        ...p,
        refinedPrompt: JSON.parse(p.refinedPrompt),
        metadata: p.metadata ? JSON.parse(p.metadata) : null,
      }))
    );
  });

  app.get(api.prompts.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const result = await db.select().from(prompts).where(eq(prompts.id, id));
    if (!result.length) return res.status(404).json({ message: "Not found" });

    res.json({
      ...result[0],
      refinedPrompt: JSON.parse(result[0].refinedPrompt),
      metadata: result[0].metadata ? JSON.parse(result[0].metadata) : null,
    });
  });
}