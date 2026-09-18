import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const DB_PATH = path.join(__dirname, "..", "data", "db.json");

export async function readDb() {
  const raw = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
}

export async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}
