import express from "express";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

import { logger } from "./logger";
import { initDB, getProfessors } from "./db";

const server = express();
server.use(pinoHttp({ logger }));

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Capstone API",
            version: "1.0.0",
        },
    },
    apis: ["./src/server.ts"],
});

server.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.get("/", (_req, res) => {
    res.redirect("/docs");
});

/**
 * @openapi
 * /api/professors:
 *   get:
 *     summary: Get professors alphabetically
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: -1
 *         description: Number of results to return (-1 means no limit)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: A list of professors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Name:
 *                     type: string
 *                   Designation:
 *                     type: string
 *                   Domain1:
 *                     type: string
 *                   Domain2:
 *                     type: string
 *                   Domain3:
 *                     type: string
 *                   Email:
 *                     type: string
 *                   ImageURL:
 *                     type: string
 *                   ProfileURL:
 *                     type: string
 */
server.get("/api/professors", async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;

    req.log.info({ limit, page }, "GET /api/professors");

    try {
        const data = await getProfessors({ limit, page });
        res.json(data);
    } catch (err) {
        req.log.error(err, "Error fetching professors");
        res.status(500).json({ error: "Internal server error" });
    }
});

initDB().then(() => {
    server.listen(3000, () => {
        logger.info("Server running on http://localhost:3000");
    });
});
