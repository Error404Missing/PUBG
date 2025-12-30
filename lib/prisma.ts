import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const libUrl =
  process.env.TURSO_DB_URL ||
  process.env.TURSO_DATABASE_URL ||
  process.env.LIBSQL_URL ||
  process.env.DATABASE_URL ||
  ''
const useLibsql = libUrl.startsWith('libsql:')

let client: PrismaClient
if (useLibsql) {
  const url = libUrl
  const authToken = process.env.TURSO_DB_AUTH_TOKEN || process.env.TURSO_DB_TOKEN || ''
  const libsql = createClient({ url, authToken })
  const adapter = new PrismaLibSQL(libsql)
  client = globalForPrisma.prisma || new PrismaClient({ adapter })
} else {
  client = globalForPrisma.prisma || new PrismaClient()
}

export const prisma = client

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
