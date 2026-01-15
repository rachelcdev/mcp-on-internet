import { z } from "zod";

// Define our tools
const TOOLS = {
  add: {
    description: "Add two numbers",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    handler: async (args: any) => {
      const { a, b } = args;
      return {
        content: [
          {
            type: "text",
            text: String(a + b),
          },
        ],
      };
    },
  },
  subtract: {
    description: "Subtract two numbers",
    inputSchema: z.object({
      a: z.number(),
      b: z.number(),
    }),
    handler: async (args: any) => {
      const { a, b } = args;
      return {
        content: [
          {
            type: "text",
            text: String(a - b),
          },
        ],
      };
    },
  },
};

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname === "/sse") {
      const sessionId = crypto.randomUUID();

      const stream = new ReadableStream({
        start(controller) {
          // Send the endpoint event
          const endpointEvent = `event: endpoint\ndata: ${url.origin}/messages?sessionId=${sessionId}\n\n`;
          controller.enqueue(new TextEncoder().encode(endpointEvent));

          // Send a keep-alive comment every 10 seconds to prevent the worker from timing out
          const intervalId = setInterval(() => {
            controller.enqueue(new TextEncoder().encode(": keepalive\n\n"));
          }, 10000);

          // Return the interval ID so we can clear it if needed (though start() result is void, 
          // we can attach cleanup logic to the stream's cancel)
          (controller as any)._intervalId = intervalId;
        },
        cancel(controller) {
          console.log("SSE client disconnected");
          clearInterval((controller as any)._intervalId);
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (url.pathname === "/messages") {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      try {
        const body = await request.json() as any;
        const { method, params, id } = body;

        let result;

        if (method === "initialize") {
          result = {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
              // We don't support resources or prompts in this simple example
            },
            serverInfo: {
              name: "simple-mcp-worker",
              version: "1.0.0",
            },
          };
        } else if (method === "notifications/initialized") {
          // Client acknowledging initialization
          // No response needed usually, but typically we return null for notifications if strictly following JSON-RPC request/response? 
          // Notifications don't have IDs.
          return new Response(null, { status: 200 });
        } else if (method === "tools/list") {
          result = {
            tools: Object.entries(TOOLS).map(([name, tool]) => ({
              name,
              description: tool.description,
              inputSchema: { // Zod schema to JSON schema conversion (simplified)
                type: "object",
                properties: {
                  a: { type: "number" },
                  b: { type: "number" }
                },
                required: ["a", "b"]
              }
            }))
          };
        } else if (method === "tools/call") {
          const toolName = params.name;
          const tool = TOOLS[toolName as keyof typeof TOOLS];

          if (!tool) {
            throw new Error(`Tool not found: ${toolName}`);
          }

          const args = params.arguments;
          // Basic validation (Zod parse)
          const parsedArgs = tool.inputSchema.parse(args);
          result = await tool.handler(parsedArgs);
        } else {
          // Unknown method, but we should return robustly
          // For MCP specifically, if it's a ping or similar
          if (method === "ping") {
            result = {};
          } else {
            // throw new Error("Method not supported");
            // Return empty for now to avoid breaking known things
          }
        }

        const responseBody = {
          jsonrpc: "2.0",
          id: id,
          result: result,
        };

        return new Response(JSON.stringify(responseBody), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });

      } catch (error: any) {
        console.error("Error handling message:", error);
        const errorBody = {
          jsonrpc: "2.0",
          id: null, // We might not have the ID if parsing failed
          error: {
            code: -32603,
            message: error.message || "Internal error",
          },
        };
        return new Response(JSON.stringify(errorBody), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 500
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
};
