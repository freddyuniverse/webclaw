import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { gatewayRpc } from "@/server/gateway"

type SessionsResolveResponse = {
  ok?: boolean
  key?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >

    const rawSessionKey =
      typeof body.sessionKey === "string" ? body.sessionKey.trim() : ""
    const friendlyId =
      typeof body.friendlyId === "string" ? body.friendlyId.trim() : ""
    const message = String(body.message ?? "")
    const thinking =
      typeof body.thinking === "string" ? body.thinking : undefined

    if (!message.trim()) {
      return NextResponse.json(
        { ok: false, error: "message required" },
        { status: 400 }
      )
    }

    let sessionKey = rawSessionKey.length > 0 ? rawSessionKey : ""

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
        return NextResponse.json(
          { ok: false, error: "session not found" },
          { status: 404 }
        )
      }
      sessionKey = resolvedKey
    }

    if (sessionKey.length === 0) {
      sessionKey = "main"
    }

    const res = await gatewayRpc<{ runId: string }>("chat.send", {
      sessionKey,
      message,
      thinking,
      deliver: false,
      timeoutMs: 120_000,
      idempotencyKey:
        typeof body.idempotencyKey === "string"
          ? body.idempotencyKey
          : randomUUID(),
    })

    return NextResponse.json({ ok: true, ...res, sessionKey })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    )
  }
}
