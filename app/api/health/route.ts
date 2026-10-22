import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const count = await prisma.transportRequest.count()
  return NextResponse.json({ ok: true, requests: count })
}
