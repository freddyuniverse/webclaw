"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function IndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/chat/main")
  }, [router])

  return (
    <div className="h-screen flex items-center justify-center text-primary-600">
      Loading...
    </div>
  )
}
