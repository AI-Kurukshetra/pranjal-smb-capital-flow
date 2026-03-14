#!/usr/bin/env node
/**
 * Kill port 3000 + Stripe, then start Next.js + stripe listen for LOCAL webhook testing.
 * Run: npm run dev:all
 * IMPORTANT: Copy "whsec_..." from stripe listen output → .env.local STRIPE_WEBHOOK_SECRET → restart
 */
import { spawn, execSync } from "child_process"
import { platform } from "os"
import { readdirSync, existsSync } from "fs"
import { join } from "path"

const isWin = platform() === "win32"
const PORT = 3000

function findStripePath() {
  if (!isWin) return "stripe"
  const base = join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages")
  if (!existsSync(base)) return "stripe"
  try {
    const d = readdirSync(base).find((x) => x.startsWith("Stripe.StripeCli"))
    if (d) {
      const exe = join(base, d, "stripe.exe")
      if (existsSync(exe)) return exe
    }
  } catch {}
  return "stripe"
}

function killPort(port) {
  try {
    if (isWin) {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8", windowsHide: true })
      const pids = new Set()
      out.trim().split("\n").forEach((line) => {
        const m = line.trim().split(/\s+/)
        const pid = m[m.length - 1]
        if (pid && pid !== "0" && !isNaN(parseInt(pid, 10))) pids.add(pid)
      })
      pids.forEach((pid) => execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore", windowsHide: true }))
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: "ignore" })
    }
  } catch {}
}

function killStripe() {
  try {
    if (isWin) execSync("taskkill /F /IM stripe.exe", { stdio: "ignore", windowsHide: true })
    else execSync("pkill -f stripe || true", { stdio: "ignore" })
  } catch {}
}

async function main() {
  console.log("Stopping port 3000 and Stripe...\n")
  killPort(PORT)
  killStripe()
  await new Promise((r) => setTimeout(r, 1500))
  console.log("Starting Next.js + stripe listen for LOCAL webhooks...\n")
  console.log(">>> Copy the whsec_... from stripe listen output into .env.local STRIPE_WEBHOOK_SECRET\n")

  const env = { ...process.env, FORCE_COLOR: "1" }
  const stripeCmd = findStripePath()
  const stripe = spawn(stripeCmd, ["listen", "--forward-to", "localhost:3000/api/stripe/webhook"], {
    stdio: "inherit",
    shell: true,
    env
  })
  const next = spawn("npm", ["run", "dev"], { stdio: "inherit", shell: true, env })
  stripe.on("error", (e) => console.error(e))
  next.on("error", (e) => console.error(e))
  stripe.on("exit", (c) => c && c !== null && process.exit(c))
  next.on("exit", (c) => c && c !== null && process.exit(c))
}

main()
