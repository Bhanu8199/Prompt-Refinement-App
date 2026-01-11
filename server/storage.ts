// import { db } from "./db";
// import { prompts, type Prompt, type InsertPrompt } from "@shared/schema";
// import { eq, desc } from "drizzle-orm";

// export interface IStorage {
//   // Prompts
//   createPrompt(prompt: InsertPrompt): Promise<Prompt>;
//   getPrompt(id: number): Promise<Prompt | undefined>;
//   getAllPrompts(): Promise<Prompt[]>;
// }

// export class DatabaseStorage implements IStorage {
//   // Prompts
//   async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
//     const [newPrompt] = await db.insert(prompts).values(prompt).returning();
//     return newPrompt;
//   }

//   async getPrompt(id: number): Promise<Prompt | undefined> {
//     const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
//     return prompt;
//   }

//   async getAllPrompts(): Promise<Prompt[]> {
//     return await db.select().from(prompts).orderBy(desc(prompts.createdAt));
//   }
// }

// export const storage = new DatabaseStorage();


import { db } from "./db";
import { prompts, type Prompt, type InsertPrompt } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import fs from "fs";
import path from "path";

export class DatabaseStorage {
  private dataFile = path.join(process.cwd(), "data", "prompts.json");
  private prompts: Prompt[] = [];
  private nextId = 1;

  constructor() {
    // Ensure data directory exists
    const dataDir = path.dirname(this.dataFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Load existing data
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, "utf-8");
        const parsed = JSON.parse(data);
        this.prompts = parsed.prompts || [];
        this.nextId = parsed.nextId || 1;
      }
    } catch (error) {
      console.warn("Failed to load data file, starting fresh:", error);
      this.prompts = [];
      this.nextId = 1;
    }
  }

  private saveData() {
    try {
      const data = {
        prompts: this.prompts,
        nextId: this.nextId
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Failed to save data file:", error);
    }
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const newPrompt: Prompt = {
      id: this.nextId++,
      originalInput: prompt.originalInput,
      inputType: prompt.inputType,
      refinedPrompt: prompt.refinedPrompt,
      confidenceScore: prompt.confidenceScore,
      metadata: prompt.metadata,
      createdAt: new Date().toISOString(),
    };

    this.prompts.push(newPrompt);
    this.saveData();
    return newPrompt;
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    return this.prompts.find(p => p.id === id);
  }

  async getAllPrompts(): Promise<Prompt[]> {
    return [...this.prompts].sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }
}

export class DatabaseStorageDB {
  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    try {
      const [created] = await db.insert(prompts).values(prompt).returning();
      return created;
    } catch (error) {
      console.error("Database error, falling back to file storage:", error);
      throw error; // Let the caller handle fallback
    }
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    try {
      const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
      return prompt;
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }

  async getAllPrompts(): Promise<Prompt[]> {
    try {
      return db.select().from(prompts).orderBy(desc(prompts.createdAt));
    } catch (error) {
      console.error("Database error:", error);
      throw error;
    }
  }
}

// Try to use database storage, fall back to file storage if database fails
let storage: DatabaseStorage | DatabaseStorageDB;

try {
  // Test database connection
  await db.execute("SELECT 1");
  console.log("Using database storage");
  storage = new DatabaseStorageDB();
} catch (error) {
  console.log("Database not available, using file storage:", error);
  storage = new DatabaseStorage();
}

export { storage };
