import express from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./create-server.js";

const app = express();
app.use(express.json());

const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
        transport = transports[sessionId];
    } else {
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sessionId: string) => {
                transports[sessionId] = transport;
            },
            enableDnsRebindingProtection: true,
            allowedHosts: ["127.0.0.1", "localhost"],
        });

        transport.onclose = () => {
            if (transport.sessionId) {
                delete transports[transport.sessionId];
            }
        };

        const server = createMcpServer();
        await server.connect(transport);
    }

    await transport.handleRequest(req, res, req.body);
});

const handleSessionRequest = async (
    req: express.Request,
    res: express.Response
) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
        res.status(400).send("Invalid or missing session ID");
        return;
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
};

app.get("/mcp", handleSessionRequest);
app.delete("/mcp", handleSessionRequest);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`MCP Google Maps HTTP server listening on port ${PORT}`);
    console.log(`Access the server at: http://localhost:${PORT}/mcp`);
});

export { app };
