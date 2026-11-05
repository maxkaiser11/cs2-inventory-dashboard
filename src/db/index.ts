import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

const DATABASE_URL = Bun.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const db = drizzle(DATABASE_URL, { schema });
