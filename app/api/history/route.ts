import { NextRequest, NextResponse } from "next/server"
import { gatewayRpc } from "@/server/gateway"

type ChatHistoryResponse = {
  sessionKey: string
  sessionId?: string
  messages: Array<any>
  thinkingLevel?: string
}

type SessionsResolveResponse = {
  ok?: boolean
  key?: string
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get("limit") || "200")
    const rawSessionKey = url.searchParams.get("sessionKey")?.trim()
    const friendlyId = url.searchParams.get("friendlyId")?.trim()

    let sessionKey =
      rawSessionKey && rawSessionKey.length > 0 ? rawSessionKey : ""

    if (!sessionKey && friendlyId) {
      const resolved = await gatewayRpc<SessionsResolveResponse>(
        "sessions.resolve",
        {
          key: friendlyId,
          includeUnknown: true,
          includeGlobal: true,
        }
      )
      const resolvedKey =
        typeof resolved.key === "string" ? resolved.key.trim() : ""
      if (resolvedKey.length === 0) {
        return NextResponse.json({ error: "session not found" }, { status: 404 })
      }
      sessionKey = resolvedKey
    }

    if (sessionKey.length === 0) {
      sessionKey = "main"
    }

    const payload = await gatewayRpc<ChatHistoryResponse>("chat.history", {
      sessionKey,
      limit,
    })

    return NextResponse.json(payload)
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}
