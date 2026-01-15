# Simple MCP Server on Cloudflare Workers

This particular MCP server provides simple arithmetic tools (`add`, `subtract`) and is designed to run on Cloudflare Workers.

## Prerequisites

- Node.js and npm installed.
- Requires `wrangler` for Cloudflare deployment (installed via devDependencies).

## Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

## Development

To run the server locally:

```bash
npm run dev
```

This will start the worker locally, typically at `http://localhost:8787`.

### Connecting to Claude Desktop (Local)

To test with Claude Desktop, you need to configure it to point to your local worker. Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-worker": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sse",
        "--url",
        "http://localhost:8787/sse"
      ]
    }
  }
}
```
*Note: Since this is an SSE server, we might need a bridge (like the one above) or client support for HTTP SSE directly.*

Wait! `claude_desktop_config.json` usually defines `command` for stdio servers. For SSE (HTTP) servers, valid configuration depends on the client.
Currently, Claude Desktop *mostly* supports stdio.
However, you can use a small proxy to convert stdio to SSE if needed, or if Claude Desktop supports SSE directly (check latest docs).
Assuming Claude Desktop supports SSE directly in `mcpServers`?
Actually, standard Claude Desktop configuration for SSE:
```json
"my-worker": {
  "url": "http://localhost:8787/sse",
  "transport": "sse" 
}
```
(Hypothetically, or use a bridge).

**Recommended for strict Local Testing:**
Use `npx -y @modelcontextprotocol/inspector` to debug.

```bash
npx @modelcontextprotocol/inspector http://localhost:8787/sse
```

## Deployment

To deploy to Cloudflare:

1. **Login to Cloudflare:**
   ```bash
   npx wrangler login
   ```

2. **Deploy:**
   ```bash
   npm run deploy
   ```

3. **Get your URL:**
   Your server is live at: `https://simple-mcp-worker.ruicao-mcp-test.workers.dev`

### Using the Deployed Server

To test your deployed server with the MCP Inspector, run:

```bash
npx @modelcontextprotocol/inspector --transport sse --server-url https://simple-mcp-worker.ruicao-mcp-test.workers.dev/sse
```

### Configuring Claude Desktop

To use this with Claude Desktop, add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-cloudflare-worker": {
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
*Note: Direct SSE support in Claude Desktop is evolving. The inspector bridge above is a reliable way to connect for now.*
