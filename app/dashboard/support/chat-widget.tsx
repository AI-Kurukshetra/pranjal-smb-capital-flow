"use client"

import { useState, useRef, useEffect } from "react"

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    setMessages((m) => [...m, { role: "user", content: text }])
    setLoading(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setMessages((m) => [...m, { role: "assistant", content: data.reply }])
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: err instanceof Error ? err.message : "Sorry, I couldn't respond. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-2xl shadow-lg hover:from-teal-700 hover:to-cyan-700"
        aria-label="Open chat"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 overflow-hidden rounded-2xl border-2 border-teal-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3">
            <h3 className="font-semibold text-slate-900">AI Help</h3>
            <p className="text-xs text-slate-600">Ask about loans, payments, or support</p>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">Ask a question, e.g. &quot;How do I make a payment?&quot;</p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "ml-8 bg-teal-100 text-teal-900" : "mr-8 bg-slate-100 text-slate-800"}`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="mr-8 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500">Thinking...</div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-slate-200 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
