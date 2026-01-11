import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const prompts = pgTable("prompts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  originalInput: text("original_input").notNull(),
  inputType: text("input_type").notNull(), // 'text', 'image', 'document'
  refinedPrompt: text("refined_prompt").notNull(), // JSON structure of refined prompt
  confidenceScore: real("confidence_score"),
  metadata: text("metadata"), // Extra info like tokens, file names
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({ 
  id: true, 
  createdAt: true 
});

export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

// Input schema for the refinement API
export const refineInputSchema = z.object({
  content: z.string(),
  type: z.enum(['text', 'image', 'document', 'video']),
  metadata: z.record(z.any()).optional()
});

export type RefineInput = z.infer<typeof refineInputSchema>;

export const refinedOutputSchema = z.object({
  primaryIntent: z.string(),
  functionalExpectations: z.array(z.string()),
  technicalConstraints: z.array(z.string()),
  expectedOutputs: z.array(z.string()),
  ambiguities: z.array(z.string()),
  missingInformation: z.array(z.string()),
  confidenceScore: z.number()
});

export type RefinedOutput = z.infer<typeof refinedOutputSchema>;
