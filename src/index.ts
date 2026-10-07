#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import pkg from "../package.json";

function getApiBase(): string {
  return process.env.SOCLIP_API_BASE || "https://api.soclip.dev";
}

function getApiKey(): string | null {
  // 1. Environment variable has highest priority
  if (process.env.SOCLIP_API_KEY && process.env.SOCLIP_API_KEY.trim() !== "") {
    return process.env.SOCLIP_API_KEY.trim();
  }

  // 2. Fallback to ~/.soclip/config.json
  try {
    const configPath = path.join(os.homedir(), ".soclip", "config.json");
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.apiKey === "string" && parsed.apiKey.trim() !== "") {
        return parsed.apiKey.trim();
      }
    }
  } catch {
    // Ignore read errors
  }

  return null;
}

const server = new Server(
  {
    name: "soclip-mcp",
    version: pkg.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_video_media",
        description:
          "Extract video media direct links and metadata from social video URLs (supports TikTok, Instagram, X/Twitter and Facebook). Costs 2 credits.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The social video URL (TikTok, Instagram, X/Twitter or Facebook)",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "get_balance",
        description: "Check user account remaining credits balance.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "API key not found. Please set SOCLIP_API_KEY environment variable or run `soclip config set-key <key>`.",
        },
      ],
    };
  }

  const apiBase = getApiBase();

  if (name === "get_video_media") {
    const url = args?.url as string;
    if (!url || typeof url !== "string") {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "Missing or invalid 'url' argument.",
          },
        ],
      };
    }

    try {
      const res = await fetch(`${apiBase}/v1/media`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      if (!res.ok || (json && (json as any).success === false)) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: (json as any)?.error || `HTTP ${res.status} request failed`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(json, null, 2),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to connect to soclip API: ${err.message || err}`,
          },
        ],
      };
    }
  }

  if (name === "get_balance") {
    try {
      const res = await fetch(`${apiBase}/v1/balance`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const json = await res.json();
      if (!res.ok || (json && (json as any).success === false)) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: (json as any)?.error || `HTTP ${res.status} request failed`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(json, null, 2),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to connect to soclip API: ${err.message || err}`,
          },
        ],
      };
    }
  }

  return {
    isError: true,
    content: [
      {
        type: "text",
        text: `Unknown tool name: ${name}`,
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error starting MCP server:", err);
  process.exit(1);
});
