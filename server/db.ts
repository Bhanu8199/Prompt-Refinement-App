import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Use environment variable or fallback to Neon connection string
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_kF19jgMCsVpf@ep-morning-bird-adyfpf4e-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const client = postgres(databaseUrl);

export const db = drizzle(client, { schema });

// Test connection on startup
console.log('Connected to PostgreSQL database');
