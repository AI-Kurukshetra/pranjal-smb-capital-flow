#!/usr/bin/env node
/**
 * Kill process on port 3000 + Stripe, then start Next.js + Stripe listen.
 * Run: npm run dev:all
 */
import { spawn, execSync } from "child_process"
import { platform } from "os"
import { readdirSync, existsSync } from "fs"
import { join } from "path"

const isWin = platform() === "win32"

function findStripePath() {
  if (!isWin) return "stripe"
  const base = join(process.env.LOCALAPPDATA || "", "Microsoft", "WinGet", "Packages")
  if (!existsSync(base)) return "stripe"
  try {
    const dirs = readdirSync(base)
    const stripeDir = dirs.find((d) => d.startsWith("Stripe.StripeCli"))
    if (stripeDir) {
      const exe = join(base, stripeDir, "stripe.exe")
      if (existsSync(exe)) return exe
    }
  } catch {}
  return "stripe"
}
const PORT = 3000

function killPort(port) {
  try {
    if (isWin) {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8", windowsHide: true })
      const lines = out.trim().split("\n")
      const pids = new Set()
      for (const line of lines) {
        const m = line.trim().split(/\s+/)
        const pid = m[m.length - 1]
        if (pid && pid !== "0" && !isNaN(parseInt(pid, 10))) pids.add(pid)
      }
      for (const pid of pids) {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore", windowsHide: true })
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: "ignore" })
    }
  } catch {}
}

function killStripe() {
  try {
    if (isWin) {
      execSync("taskkill /F /IM stripe.exe", { stdio: "ignore", windowsHide: true })
    } else {
      execSync("pkill -f stripe || true", { stdio: "ignore" })
    }
  } catch {}
}

async function killProcesses() {
  console.log("Stopping existing processes (port 3000, Stripe)...\n")
  killPort(PORT)
  killStripe()
  return new Promise((r) => setTimeout(r, 2000))
}

async function main() {
  await killProcesses()
  console.log("Starting Next.js and Stripe webhook listener...\n")

  const env = { ...process.env, FORCE_COLOR: "1" }
  const stripeCmd = findStripePath()

  const stripe = spawn(stripeCmd, ["listen", "--forward-to", "localhost:3000/api/stripe/webhook"], {
    stdio: "inherit",
    shell: true,
    env
  })

  const next = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    shell: true,
    env
  })

  ;[next, stripe].forEach((p) => {
    p.on("error", (err) => console.error(err))
    p.on("exit", (code) => {
      if (code !== 0 && code !== null) process.exit(code)
    })
  })
}

main()
