import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { db } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { extractTextFromFile, getFileType, type FileType } from "./textExtraction";
import { api } from "../shared/routes";
import { prompts, insertPromptSchema, refinedOutputSchema, refineInputSchema } from "../shared/schema";
import { eq } from "drizzle-orm";

// Fallback analysis function for when AI fails
function analyzeInputFallback(input: string): {
  primaryIntent: string;
  functionalExpectations: string[];
  technicalConstraints: string[];
  expectedOutputs: string[];
  ambiguities: string[];
  missingInformation: string[];
  confidenceScore: number;
} {
  const lowerInput = input.toLowerCase();

  // Basic keyword analysis
  const keywords = {
    create: lowerInput.includes('create') || lowerInput.includes('build') || lowerInput.includes('make'),
    app: lowerInput.includes('app') || lowerInput.includes('application') || lowerInput.includes('website'),
    todo: lowerInput.includes('todo') || lowerInput.includes('task') || lowerInput.includes('list'),
    react: lowerInput.includes('react') || lowerInput.includes('vue') || lowerInput.includes('angular'),
    api: lowerInput.includes('api') || lowerInput.includes('backend') || lowerInput.includes('server'),
    database: lowerInput.includes('database') || lowerInput.includes('db') || lowerInput.includes('data'),
    login: lowerInput.includes('login') || lowerInput.includes('auth') || lowerInput.includes('authentication'),
    user: lowerInput.includes('user') || lowerInput.includes('account') || lowerInput.includes('profile'),
  };

  let primaryIntent = "Create a software application";
  let functionalExpectations: string[] = [];
  let technicalConstraints: string[] = [];
  let expectedOutputs: string[] = [];
  let ambiguities: string[] = [];
  let missingInformation: string[] = [];
  let confidenceScore = 0.6;

  if (keywords.create && keywords.app) {
    primaryIntent = "Develop a software application";
    functionalExpectations = ["Implement core functionality", "Create user interface"];
    expectedOutputs = ["Working application", "User-friendly interface"];

    if (keywords.todo) {
      primaryIntent = "Build a task management application";
      functionalExpectations = ["Add tasks", "Mark tasks complete", "Delete tasks", "View task list"];
      expectedOutputs = ["Functional todo list", "Task completion tracking"];
      technicalConstraints = ["Web-based application"];
      ambiguities = ["Specific UI design not specified"];
      missingInformation = ["Persistence requirements", "Multi-user support"];
      confidenceScore = 0.85;
    } else if (keywords.api) {
      primaryIntent = "Build a backend API service";
      functionalExpectations = ["Provide API endpoints", "Handle data processing", "Return structured responses"];
      expectedOutputs = ["RESTful API", "Documentation"];
      technicalConstraints = ["Backend framework implementation"];
      ambiguities = ["Specific endpoints not detailed"];
      missingInformation = ["Data models", "Authentication method"];
      confidenceScore = 0.8;
    } else if (keywords.login) {
      primaryIntent = "Implement user authentication system";
      functionalExpectations = ["User registration", "Login functionality", "Session management"];
      expectedOutputs = ["Secure authentication", "User sessions"];
      technicalConstraints = ["Security best practices"];
      ambiguities = ["Authentication method not specified"];
      missingInformation = ["User data storage", "Password policies"];
      confidenceScore = 0.8;
    } else {
      // Generic app creation
      functionalExpectations = ["Implement core features", "Create user interface", "Handle user interactions"];
      expectedOutputs = ["Functional application"];
      technicalConstraints = ["Modern web technologies"];
      ambiguities = ["Specific features not detailed"];
      missingInformation = ["Target platform", "Design requirements", "Functionality scope"];
      confidenceScore = 0.7;
    }

    if (keywords.react) {
      technicalConstraints.push("Frontend framework: React");
    }

    if (keywords.database) {
      technicalConstraints.push("Database integration required");
      functionalExpectations.push("Data persistence and retrieval");
    }

    if (keywords.user) {
      functionalExpectations.push("User management features");
    }

  } else if (input.trim().length > 0) {
    // Try to extract some meaning from non-standard inputs
    primaryIntent = "Process user requirements";
    functionalExpectations = ["Analyze input requirements"];
    expectedOutputs = ["Structured requirements analysis"];
    ambiguities = ["Requirements not clearly specified"];
    missingInformation = ["Specific goals and constraints"];
    confidenceScore = 0.5;
  } else {
    ambiguities = ["No clear requirements provided"];
    missingInformation = ["User input required"];
    confidenceScore = 0.3;
  }

  return {
    primaryIntent,
    functionalExpectations,
    technicalConstraints,
    expectedOutputs,
    ambiguities,
    missingInformation,
    confidenceScore,
  };
}

const HF_MODEL =
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

async function refineWithHuggingFace(prompt: string) {
  const response = await fetch(HF_MODEL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: `
You are an expert AI prompt engineer specializing in analyzing user requirements and generating structured prompt refinements.

Your task is to analyze the user input and return ONLY a valid JSON object with the following exact structure:

{
  "primaryIntent": "string describing the main goal",
  "functionalExpectations": ["array of strings for what the system should do"],
  "technicalConstraints": ["array of strings for technical limitations"],
  "expectedOutputs": ["array of strings for desired results"],
  "ambiguities": ["array of strings for unclear parts"],
  "missingInformation": ["array of strings for information needed"],
  "confidenceScore": number between 0 and 1
}

Rules:
- Return ONLY the JSON object, no additional text
- Ensure all arrays are present even if empty
- confidenceScore must be a number between 0 and 1
- Be specific and actionable in your analysis
- If input is unclear, note ambiguities and missing information

Example for "Create a todo app":
{
  "primaryIntent": "Build a task management application",
  "functionalExpectations": ["Add tasks", "Mark tasks complete", "Delete tasks"],
  "technicalConstraints": ["Web-based", "Responsive design"],
  "expectedOutputs": ["Functional todo list", "User-friendly interface"],
  "ambiguities": ["Specific features not mentioned"],
  "missingInformation": ["Target platform", "Authentication requirements"],
  "confidenceScore": 0.8
}

User input:
${prompt}
      `,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.1,
        do_sample: true,
        top_p: 0.9,
      },
    }),
  });

  const result = await response.json();
  console.log('Hugging Face API response:', JSON.stringify(result, null, 2));

  // Hugging Face returns array output
  const text = result[0]?.generated_text;

  if (!text) {
    throw new Error('No generated text in Hugging Face response');
  }

  // Extract JSON safely - look for the JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Hugging Face response');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    throw new Error('Invalid JSON in Hugging Face response');
  }

  // Validate the structure
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

  return parsed;
}

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow various file types
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'video/mp4',
      'video/avi',
      'video/quicktime',
    ];

    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(txt|md|pdf|docx|png|jpg|jpeg|gif|bmp|mp4|avi|mov)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

// Configure multer to parse text fields and file
const uploadFields = upload.fields([
  { name: 'input_text', maxCount: 1 },
  { name: 'file', maxCount: 1 },
  { name: 'source_type', maxCount: 1 }
]);

export function registerRoutes(httpServer: any, app: Express) {
  // Ensure uploads directory exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // Refine prompt endpoint with file upload support
  app.post(api.prompts.refine.path, uploadFields, async (req, res) => {
    try {
      const inputText = req.body.input_text || '';
      const sourceType = Array.isArray(req.body.source_type) ? req.body.source_type[0] : req.body.source_type || 'text';
      let extractedContent = inputText;
      let fileType: FileType = 'text';
      let metadata: any = {};

      // If a file was uploaded, extract text from it
      if (req.files && (req.files as any).file && (req.files as any).file.length > 0) {
        const file = (req.files as any).file[0];
        fileType = getFileType(file.originalname, file.mimetype);
        extractedContent = await extractTextFromFile(file.path, fileType);
        metadata = { filename: file.originalname, size: file.size };

        // Clean up uploaded file after processing
        fs.unlinkSync(file.path);
      }

      // If no content extracted and no input text, return error
      if (!extractedContent.trim()) {
        return res.status(400).json({
          message: "No readable content found. Please provide text input or upload a valid file."
        });
      }

      // Map fileType to schema type
      let schemaType = sourceType;
      if (fileType !== 'text') {
        if (fileType === 'pdf' || fileType === 'docx') {
          schemaType = 'document';
        } else {
          schemaType = fileType;
        }
      }

      // Validate input
      const input = {
        content: extractedContent,
        type: schemaType,
        metadata,
      };

      console.log('Input before validation:', input);
      console.log('sourceType:', sourceType, 'type of:', typeof sourceType);

      const validatedInput = refineInputSchema.parse(input);

      // Use local analysis for better user input-specific responses
      const refinedOutput = analyzeInputFallback(validatedInput.content);

      // refinedOutput is already parsed from Hugging Face

      // Validate the refined output
      const validatedRefinedOutput = refinedOutputSchema.parse(refinedOutput);

      // Save to database
      const promptRecord = await db.insert(prompts).values({
        originalInput: validatedInput.content,
        inputType: validatedInput.type,
        refinedPrompt: JSON.stringify(refinedOutput),
        confidenceScore: refinedOutput.confidenceScore,
        metadata: JSON.stringify(validatedInput.metadata),
      }).returning();

      res.status(201).json(promptRecord[0]);
    } catch (error) {
      console.error('Error in refine endpoint:', error);

      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", field: error.errors[0]?.path?.join('.') });
      } else {
        res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
      }
    }
  });

  // List prompts endpoint
  app.get(api.prompts.list.path, async (req, res) => {
    try {
      const allPrompts = await db.select().from(prompts).orderBy(prompts.createdAt);
      const parsedPrompts = allPrompts.map(prompt => ({
        ...prompt,
        refinedPrompt: JSON.parse(prompt.refinedPrompt),
        metadata: prompt.metadata ? JSON.parse(prompt.metadata) : null,
      }));
      res.json(parsedPrompts);
    } catch (error) {
      console.error('Error listing prompts:', error);
      res.status(500).json({ message: "Failed to list prompts" });
    }
  });

  // Get prompt by ID endpoint
  app.get(api.prompts.get.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prompt = await db.select().from(prompts).where(eq(prompts.id, id)).limit(1);

      if (!prompt.length) {
        res.status(404).json({ message: "Prompt not found" });
      } else {
        const parsedPrompt = {
          ...prompt[0],
          refinedPrompt: JSON.parse(prompt[0].refinedPrompt),
          metadata: prompt[0].metadata ? JSON.parse(prompt[0].metadata) : null,
        };
        res.json(parsedPrompt);
      }
    } catch (error) {
      console.error('Error getting prompt:', error);
      res.status(500).json({ message: "Failed to get prompt" });
    }
  });
}
