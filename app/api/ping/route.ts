import { NextResponse } from "next/server"
import { gatewayConnectCheck } from "@/server/gateway"

export async function GET() {
  try {
    await gatewayConnectCheck()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 503 }
    )
  }
}
