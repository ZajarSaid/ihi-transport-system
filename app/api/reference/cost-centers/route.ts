import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await prisma.costCenter.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(rows)
}
