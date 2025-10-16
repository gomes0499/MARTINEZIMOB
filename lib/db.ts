import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED

if (!databaseUrl) {
  console.error(
    "[v0] Available env vars:",
    Object.keys(process.env).filter((k) => k.includes("DATABASE") || k.includes("POSTGRES")),
  )
  throw new Error("DATABASE_URL, POSTGRES_URL, or DATABASE_URL_UNPOOLED must be set")
}

console.log("[v0] Using database connection")
export const sql = neon(databaseUrl)
