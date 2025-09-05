import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
// Import supabase
import { getSupabaseService } from "@/src/lib/supabase";
import { getSupabaseStorage } from '@/src/services/storage/supabase'
// 🔒 Import secure file validation
import { validateFileSecurity, sanitizeFilename, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/src/core/security/file-validation'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 🔒 SECURE FILE VALIDATION - Prevents malware and spoofed files
    const validation = await validateFileSecurity(file)
    if (!validation.isValid) {
      return NextResponse.json({
        error: `Security validation failed: ${validation.error}`
      }, { status: 400 })
    }

    // Get multimodal context metadata
    const sessionId = request.headers.get('x-intelligence-session-id')
    const userId = request.headers.get('x-user-id')
    const modalityType = request.headers.get('x-modality-type') || 'upload'

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 🔒 SECURE FILENAME - Prevents directory traversal attacks
    const timestamp = Date.now()
    const sanitizedName = sanitizeFilename(file.name)
    const filename = `${timestamp}_${sanitizedName}`
    const filepath = join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Return file info
    const fileUrl = `/uploads/${filename}`
    
    // Log upload to Supabase if configured
    try {
      const supabase = getSupabaseService()
      const { error: logError } = await supabase.from('upload_logs').insert({
        filename,
        original_name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        uploaded_at: new Date().toISOString(),
        session_id: request.headers.get('x-intelligence-session-id') || null,
        user_id: request.headers.get('x-user-id') || null
      })
      // Failed to log upload
    } catch (dbError) {
      // Database logging error occurred
      // Don't fail the upload if logging fails
    }
    
    // Prepare multimodal integration
    const multimodalData: {
      fileUrl: string;
      filename: string;
      originalName: string;
      size: number;
      type: string;
      uploadedAt: string;
      modalityType: string;
      sessionId: string | null;
      userId: string | null;
      analysis?: string;
    } = {
      fileUrl,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      modalityType,
      sessionId,
      userId
    }

    // If this is a visual file (image/video), trigger analysis automatically
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      try {
        // Convert file to base64 for analysis
        const fileBuffer = await file.arrayBuffer()
        const base64Data = Buffer.from(fileBuffer).toString('base64')
        const dataUrl = `data:${file.type};base64,${base64Data}`

        // Trigger visual analysis
        const analysisResponse = await fetch(`${process.env.BASE_URL || 'http://localhost:3000'}/api/tools/webcam`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-intelligence-session-id': sessionId || '',
            'x-user-id': userId || ''
          },
          body: JSON.stringify({
            image: dataUrl,
            type: modalityType
          })
        })

        if (analysisResponse.ok) {
          const analysisResult = await analysisResponse.json()
          multimodalData.analysis = analysisResult.output?.analysis
        }
      } catch (analysisError) {
        // Warning log removed - could add proper error handling here
      }
    }

    return NextResponse.json({
      success: true,
      ...multimodalData
    })

  } catch (error) {
    // Upload API Error occurred
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Upload endpoint is working',
    maxFileSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    allowedTypes: ALLOWED_FILE_TYPES
  })
}
