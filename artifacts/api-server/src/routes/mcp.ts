import { Router, type IRouter } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "../lib/mcpServer";

// Endpoint MCP (Model Context Protocol) su trasporto Streamable HTTP, in
// modalità stateless: per ogni richiesta creiamo un server e un trasporto
// effimeri (sessionIdGenerator: undefined => nessuna sessione persistente).
// Questo è il pattern consigliato per ambienti serverless/proxy e tiene il
// server senza stato condiviso tra client. Sola lettura.
const router: IRouter = Router();

router.post("/", async (req, res) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    req.log?.error({ err }, "MCP request error");
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Errore interno del server" },
        id: null,
      });
    }
  }
});

// MCP Streamable HTTP usa solo POST in modalità stateless. GET/DELETE (usati per
// le sessioni SSE persistenti) non sono supportati: rispondiamo 405.
function methodNotAllowed(_req: unknown, res: {
  status: (code: number) => { json: (body: unknown) => void };
}) {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Metodo non consentito" },
    id: null,
  });
}

router.get("/", methodNotAllowed);
router.delete("/", methodNotAllowed);

export default router;
