"use client"

import { useCallback, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ChatScreen } from "@/screens/chat/chat-screen"
import { moveHistoryMessages } from "@/screens/chat/chat-queries"

export default function ChatPage() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const params = useParams()
  const [forcedSession, setForcedSession] = useState<{
    friendlyId: string
    sessionKey: string
  } | null>(null)

  const activeFriendlyId =
    typeof params.sessionKey === "string" ? params.sessionKey : "main"
  const isNewChat = activeFriendlyId === "new"
  const forcedSessionKey =
    forcedSession?.friendlyId === activeFriendlyId
      ? forcedSession.sessionKey
      : undefined

  const handleSessionResolved = useCallback(
    function handleSessionResolved(payload: {
      friendlyId: string
      sessionKey: string
    }) {
      moveHistoryMessages(
        queryClient,
        "new",
        "new",
        payload.friendlyId,
        payload.sessionKey
      )
      setForcedSession({
        friendlyId: payload.friendlyId,
        sessionKey: payload.sessionKey,
      })
      router.replace(`/chat/${payload.friendlyId}`)
    },
    [router, queryClient]
  )

  return (
    <ChatScreen
      activeFriendlyId={activeFriendlyId}
      isNewChat={isNewChat}
      forcedSessionKey={forcedSessionKey}
      onSessionResolved={isNewChat ? handleSessionResolved : undefined}
    />
  )
}
