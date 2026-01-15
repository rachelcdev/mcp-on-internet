# Building a Remote MCP Server on Cloudflare (Without Auth)

This example allows you to deploy a remote MCP server that doesn't require authentication on Cloudflare Workers. 

## Project Structure
Contains the Cloudflare Worker source code
  - `src/index.ts`: Main worker logic implementing MCP protocol over HTTP/SSE
  - `package.json`: Dependencies (`@modelcontextprotocol/sdk`, `zod`, `wrangler`)
  - `wrangler.json`: Cloudflare configuration

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   This will start the server at `http://localhost:8787`

3. **Test with MCP Inspector:**
   ```bash
   npx @modelcontextprotocol/inspector http://localhost:8787/sse
   ```
Note: Open another terminal and ensure to use the `SSE` transport for local development. URL should be `http://localhost:8787/sse`.

Click `Connect` to connect to your local server. You should see the tools become available.

## Deployment

```bash
npm run deploy
```
Your server will be deployed to: `https://remote-mcp-server-authless.<your-account>.workers.dev`

## Usage

### 1. Verify with MCP Inspector

Test your deployed server:
```bash
npx @modelcontextprotocol/inspector --transport sse --server-url https://remote-mcp-server-authless.<your-account>.workers.dev/sse
```

### 2. Connect to Cloudflare AI Playground

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server URL (`remote-mcp-server-authless.<your-account>.workers.dev/sse`)
3. Use your MCP tools directly from the playground!

### 3. Connect to Claude Desktop

You can also connect to your remote MCP server from local MCP clients, by using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote). 

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"  // or remote-mcp-server-authless.your-account.workers.dev/sse
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available. 
