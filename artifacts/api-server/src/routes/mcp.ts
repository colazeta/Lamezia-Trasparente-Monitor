import { Router, type IRouter } from "express";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpServer } from "../lib/mcpServer";

// Public MCP endpoint. The v2 handler serves the current stateless MCP protocol
// and keeps legacy stateless compatibility for 2025-era clients. A fresh
// McpServer is created for every request, so no client state, credentials or
// tool results are shared across requests.
const router: IRouter = Router();
const mcpHandler = createMcpHandler(createMcpServer);
const nodeHandler = toNodeHandler(mcpHandler);

router.all("/", (req, res) => {
  void nodeHandler(req, res, req.body);
});

export default router;
