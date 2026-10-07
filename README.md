# soclip-mcp

> Model Context Protocol (MCP) server for [soclip.dev](https://soclip.dev) - allow AI assistants like Claude Desktop and Cursor to extract social video media direct links and metadata.

## Overview

`soclip-mcp` connects LLMs with the Soclip API to analyze and retrieve direct video download URLs and metadata from TikTok, Instagram, X/Twitter and Facebook.

Get your API key at [https://soclip.dev](https://soclip.dev).

> Docs for `soclip-mcp@0.1.3` — last updated 2026-10-07.
> Plain-text docs for AI agents: <https://soclip.dev/llms.txt>

## Setup & Configuration

### Claude Desktop

Add `soclip` to your `claude_desktop_config.json` (located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "soclip": {
      "command": "npx",
      "args": ["-y", "soclip-mcp"],
      "env": {
        "SOCLIP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json` or Cursor Settings -> Features -> MCP Servers):

```json
{
  "mcpServers": {
    "soclip": {
      "command": "npx",
      "args": ["-y", "soclip-mcp"],
      "env": {
        "SOCLIP_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

*Note: If you have already set up your key using the CLI (`soclip config set-key <key>`), `soclip-mcp` will automatically read `~/.soclip/config.json` if `SOCLIP_API_KEY` is not present in `env`.*

## Available Tools

### 1. `get_video_media`
Extract direct video download URLs and detailed metadata from a social media video URL. Costs 2 credits ($0.002) per request.

- **Parameters**:
  - `url` (string, required): The video link (TikTok, Instagram, X/Twitter or Facebook).

### 2. `get_balance`
Check your current account remaining credit balance.

- **Parameters**: None.

## Documentation

- Full docs: <https://soclip.dev/docs>
- Plain-text docs for AI agents: <https://soclip.dev/llms.txt>
- Terminal CLI: [`soclip-cli`](https://www.npmjs.com/package/soclip-cli)

## License

MIT License &copy; 2026 [soclip](https://soclip.dev)
