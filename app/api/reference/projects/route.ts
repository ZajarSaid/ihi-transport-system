import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await prisma.project.findMany({
    include: { costCenter: true },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json(rows)
}
