"use client"

import { useRouter } from "next/navigation"

type BackLinkProps = {
  fallbackHref: string
  label?: string
  className?: string
}

export function BackLink({ fallbackHref, label = "Back", className }: BackLinkProps) {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={className ?? "text-sm font-semibold text-teal-700 hover:text-teal-800"}
    >
      {`<- ${label}`}
    </button>
  )
}
