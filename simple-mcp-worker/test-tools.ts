
import { fetch } from "undici"; // Built-in in Node 18+, but safe to assume fetch exists or use this. 
// actually standard 'fetch' is available in Node 22 (user's env likely).
// We'll use standard fetch.

const SERVER_URL = "https://simple-mcp-worker.ruicao-mcp-test.workers.dev";
const SESSION_ID = "test-session-" + Date.now();

async function main() {
    console.log(`Testing MCP Server at: ${SERVER_URL}`);

    // 1. Start SSE Session (Handshake)
    // In a real client, we'd listen to SSE. For a simple HTTP test, we just need to know the POST URL.
    // Our server implementation returns the POST URL in the SSE Hello, OR we can just construct it 
    // if we know the pattern (which we do: /messages?sessionId=...)
    // But let's verify the /sse endpoint exists.

    const sseResponse = await fetch(`${SERVER_URL}/sse`);
    if (!sseResponse.ok) {
        throw new Error(`Failed to connect to SSE: ${sseResponse.statusText}`);
    }
    console.log("✅ SSE Endpoint is reachable");
    // We won't keep the stream open in this simple script, we just proceed to POST.

    const MESSAGES_URL = `${SERVER_URL}/messages?sessionId=${SESSION_ID}`;

    // 2. call "initialize"
    const initResponse = await fetch(MESSAGES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: { name: "test-script", version: "1.0" }
            }
        })
    });
    const initResult = await initResponse.json();
    console.log("✅ Initialized:", (initResult as any).result.serverInfo);

    // 3. Call "tools/list"
    const listResponse = await fetch(MESSAGES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list",
            params: {}
        })
    });
    const listResult = await listResponse.json();
    const tools = (listResult as any).result.tools;
    console.log("✅ Found tools:", tools.map((t: any) => t.name).join(", "));

    // 4. Test "add" tool
    console.log("Testing 'add' tool (10 + 5)...");
    const addResponse = await fetch(MESSAGES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: {
                name: "add",
                arguments: { a: 10, b: 5 }
            }
        })
    });
    const addResult = await addResponse.json();
    const addOutput = (addResult as any).result.content[0].text;

    if (addOutput === "15") {
        console.log("✅ 'add' tool passed: Result is 15");
    } else {
        console.error("❌ 'add' tool failed:", addOutput);
    }
}

main().catch(console.error);
