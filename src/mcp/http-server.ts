import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./create-server.js";

const app = express();
app.use(express.json());

app.post("/mcp", async (req: express.Request, res: express.Response) => {
    // In stateless mode, create a new instance of transport and server for each request
    // to ensure complete isolation. A single instance would cause request ID collisions
    // when multiple clients connect concurrently.

    try {
        const server = createMcpServer();
        const transport: StreamableHTTPServerTransport =
            new StreamableHTTPServerTransport({
                sessionIdGenerator: undefined,
                enableDnsRebindingProtection: true,
                allowedHosts: ["127.0.0.1", "localhost", "localhost:3333"],
            });

        res.on("close", () => {
            console.log("Request closed");
            transport.close();
            server.close();
        });

        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: {
                    code: -32603,
                    message: "Internal server error",
                },
                id: null,
            });
        }
    }
});

app.get("/mcp", async (req: express.Request, res: express.Response) => {
    console.log("Received GET MCP request");
    res.writeHead(405).end(
        JSON.stringify({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Method not allowed.",
            },
            id: null,
        })
    );
});

app.delete("/mcp", async (req: express.Request, res: express.Response) => {
    console.log("Received DELETE MCP request");
    res.writeHead(405).end(
        JSON.stringify({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Method not allowed.",
            },
            id: null,
        })
    );
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`MCP Google Maps HTTP server listening on port ${PORT}`);
    console.log(`Access the server at: http://localhost:${PORT}/mcp`);
});

export { app };
