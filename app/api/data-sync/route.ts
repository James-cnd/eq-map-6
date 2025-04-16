import type { NextRequest } from "next/server"

// Store connected clients
const clients = new Set<ReadableStreamDefaultController>()

// Function to send updates to all connected clients
export function sendUpdateToClients(key: string) {
  const data = JSON.stringify({
    key,
    timestamp: Date.now(),
  })

  clients.forEach((controller) => {
    controller.enqueue(`event: data-update\ndata: ${data}\n\n`)
  })
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  return new Response(
    new ReadableStream({
      start(controller) {
        clients.add(controller)

        // Send initial connection message
        controller.enqueue(encoder.encode('event: connected\ndata: {"status":"connected"}\n\n'))

        // Keep the connection alive with a comment every 30 seconds
        const keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode(": keepalive\n\n"))
        }, 30000)

        // Remove client when they disconnect
        request.signal.addEventListener("abort", () => {
          clients.delete(controller)
          clearInterval(keepAlive)
        })
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    },
  )
}
