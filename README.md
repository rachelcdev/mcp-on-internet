# Agent on Internet: Simple MCP Server

We have successfully created and deployed a simple Model Context Protocol (MCP) server to Cloudflare Workers. This server implements basic arithmetic tools (`add`, `subtract`) and uses the SSE (Server-Sent Events) transport layer.

## Project Structure

- **simple-mcp-worker/**: Contains the Cloudflare Worker source code.
  - `src/index.ts`: Main worker logic implementing MCP protocol over HTTP/SSE.
  - `package.json`: Dependencies (`@modelcontextprotocol/sdk`, `zod`, `wrangler`).
  - `wrangler.json`: Cloudflare configuration.

## Accomplishments

1.  **Manual SSE Transport Implementation**:
    - Implemented a custom SSE endpoint (`/sse`) and message handler (`/messages`) in `src/index.ts` to support MCP over HTTP on Cloudflare Workers (since standard SDK defaults to stdio).
    - **Key Fixes**:
        - **Absolute URLs**: Ensure the server returns absolute URLs (e.g., `https://.../messages`) in SSE events so external clients can connect.
        - **Keep-Alive**: Added a 10-second heartbeat to the SSE stream to prevent Cloudflare from timing out the connection.

2.  **Deployment**:
    - Deployed to Cloudflare Workers at: `https://simple-mcp-worker.ruicao-mcp-test.workers.dev`

## Usage Guide

### 1. Verification with Script
We created a verification script `test-tools.ts` to programmatically test the server:
```bash
cd simple-mcp-worker
npx tsx test-tools.ts
```

### 2. Verification with MCP Inspector
You can use the official MCP Inspector to test the live server:
```bash
npx @modelcontextprotocol/inspector --transport sse --server-url https://simple-mcp-worker.ruicao-mcp-test.workers.dev/sse
```

### 3. Usage with Claude Desktop
To use this server with Claude Desktop, configure your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "my-worker": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/inspector",
        "--transport", "sse",
        "--server-url", "https://simple-mcp-worker.ruicao-mcp-test.workers.dev/sse"
      ]
    }
  }
}
```

## Next Steps

- Expand the toolset in `src/index.ts`.
- Implement authentication for the endpoints.
- Connect to real data sources (D1, KV, external APIs).