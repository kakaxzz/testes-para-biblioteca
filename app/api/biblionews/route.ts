import { promises as fs } from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

const dataFile = path.join(process.cwd(), "data", "biblionews.json")

type Notice = {
  id: number
  titulo: string
  mensagem: string
  tag: string
}

async function readNotices(): Promise<Notice[]> {
  const file = await fs.readFile(dataFile, "utf-8")
  return JSON.parse(file) as Notice[]
}

async function writeNotices(notices: Notice[]) {
  await fs.writeFile(dataFile, JSON.stringify(notices, null, 2), "utf-8")
}

export async function GET() {
  try {
    const notices = await readNotices()
    return NextResponse.json(notices)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const notices = (await request.json()) as Notice[]
    if (!Array.isArray(notices)) {
      return NextResponse.json({ message: "Payload must be an array." }, { status: 400 })
    }
    await writeNotices(notices)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ message: "Unable to save notices." }, { status: 500 })
  }
}
