import Groq from "groq-sdk"

const RELEVANCE_PROMPT = `Is this document useful for a BUSINESS LOAN application?

RELEVANT if it contains or supports financial/business context: bank statements, tax returns, P&L, balance sheet, revenue/sales, expenses, invoices with amounts, business licenses, contracts showing obligations or revenue, ID/incorporation docs, or any document with dollar amounts or financial figures.

NOT relevant only if clearly: pure marketing brochures, generic photos with no business data, personal letters with no financial info, or documents with zero business/financial context. When unsure or document has some business/financial relevance, return true.
Reply with ONLY valid JSON, no other text: {"is_relevant": true} or {"is_relevant": false}`

export type ValidateResult = { is_relevant: boolean }

export async function validateDocumentRelevance(
  fileData: ArrayBuffer,
  filePath: string
): Promise<ValidateResult> {
  if (!process.env.GROQ_API_KEY) {
    return { is_relevant: true }
  }

  const ext = filePath.split(".").pop()?.toLowerCase()
  let textForAI = ""

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) {
    const base64 = Buffer.from(fileData).toString("base64")
    const mimeType = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : ext === "webp" ? "image/webp" : "image/jpeg"
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: RELEVANCE_PROMPT },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` }
            }
          ]
        }
      ],
      temperature: 0,
      max_tokens: 80
    })
    textForAI = completion.choices[0]?.message?.content?.trim() || "{}"
  } else if (ext === "pdf") {
    const { PDFParse } = await import("pdf-parse")
    const parser = new PDFParse({ data: new Uint8Array(fileData) })
    try {
      const result = await parser.getText()
      const text = result?.text?.slice(0, 3000) || ""
      await parser.destroy()
      if (!text.trim()) {
        return { is_relevant: false }
      }
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `${RELEVANCE_PROMPT}\n\nDocument text (excerpt):\n${text}`
          }
        ],
        temperature: 0,
        max_tokens: 80
      })
      textForAI = completion.choices[0]?.message?.content?.trim() || "{}"
    } catch {
      await parser.destroy()
      return { is_relevant: false }
    }
  } else {
    return { is_relevant: false }
  }

  try {
    const match = textForAI.match(/\{[\s\S]*\}/)
    const parsed = match ? JSON.parse(match[0]) : {}
    return { is_relevant: !!parsed.is_relevant }
  } catch {
    return { is_relevant: false }
  }
}
