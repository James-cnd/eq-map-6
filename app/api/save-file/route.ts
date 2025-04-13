import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { path, content } = body

        // Basic validation
        if (!path || !content) {
            return NextResponse.json(
                { error: 'Path and content are required' },
                { status: 400 }
            )
        }

        // Security check - only allow saving to specific directories
        if (!path.startsWith('data/')) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            )
        }

        // Get the absolute path
        const fullPath = join(process.cwd(), path)

        // Write the file
        await writeFile(fullPath, content, 'utf-8')

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving file:', error)
        return NextResponse.json(
            { error: 'Failed to save file' },
            { status: 500 }
        )
    }
}