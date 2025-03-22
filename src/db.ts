import { MongoClient, type Db, type Collection } from "mongodb"
import { z } from "zod"

import { env } from "./env"
import { logger } from "./logger"

const DATABASE_URL = `mongodb+srv://${env.DB_USER}:${env.DB_PASS}@${env.DB_HOST}/?${env.DB_QUERY}`;

const facultySchema = z.object({
    Name: z.string(),
    Designation: z.string(),
    Domain1: z.string(),
    Domain2: z.string(),
    Domain3: z.string(),
    Email: z.string().email(),
    ImageURL: z.string().url(),
    ProfileURL: z.string().url(),
});

type Faculty = z.infer<typeof facultySchema>;

let db: Db;

export async function initDB(): Promise<void> {
    const client = new MongoClient(DATABASE_URL);
    await client.connect();
    db = client.db(env.DATABASE_NAME);
    logger.info("Connected to MongoDB");
}

export function getFacultyCollection(): Collection<Faculty> {
    if (!db) {
        logger.error("Attempted to access collection before DB initialization");
        throw new Error("Database not initialized. Call initDB() first.");
    }
    logger.debug("Accessed faculty_details collection");
    return db.collection<Faculty>("faculty_details");
}

export async function getProfessors({
    limit,
    page = 1,
}: {
    limit?: number;
    page?: number;
}): Promise<Faculty[]> {
    const collection = getFacultyCollection();
    logger.info({ limit, page }, "Fetching professors");

    const query = collection.find({}).sort({ Name: 1 });

    if (limit !== undefined && limit > 0) {
        query.skip((page - 1) * limit).limit(limit);
    }

    const data = await query.toArray();
    logger.debug({ count: data.length }, "Fetched professors");
    return data.map((doc) => facultySchema.parse(doc));
}
