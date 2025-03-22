import { z } from "zod"
import { createEnv } from "@t3-oss/env-core"

export const env = createEnv({
    server: {
        PORT: z.number().default(3000),
        DB_USER: z.string(),
        DB_PASS: z.string(),
        DB_HOST: z.string(),
        DB_QUERY: z.string(),
        DATABASE_NAME: z.string(),
    },
    runtimeEnv: process.env,
});
