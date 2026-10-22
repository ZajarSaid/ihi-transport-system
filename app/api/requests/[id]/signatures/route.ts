import { auth } from '@/src/auth'
import { prisma } from '@/src/lib/prisma'
import { NextResponse } from 'next/server'
import { mapRequestFromDb } from '@/src/lib/mappers'

export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'file required' }, { status: 400 })
    }
    const bytes = Buffer.from(await file.arrayBuffer())
    const signature = await prisma.signature.create({
      data: {
        requestId: id,
        fileName: file.name || 'signature',
        fileType: file.type || 'application/octet-stream',
        data: bytes,
      },
    })
    return NextResponse.json({ id: signature.id, fileName: signature.fileName, fileType: signature.fileType })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
