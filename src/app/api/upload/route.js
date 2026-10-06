import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const MAX_FILE_SIZE_BYTES = 200 * 1024; // 200 KB

export async function POST(req) {
  try {
    let folder = 'proofs';
    let fileBuffer = null;
    let fileName = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      folder = formData.get('folder') || 'proofs';
      const file = formData.get('file') || formData.get('image');

      if (!file || typeof file === 'string') {
        return NextResponse.json({
          success: false,
          error: { code: 'NO_FILE', message: 'No file provided in form request' }
        }, { status: 400 });
      }

      fileName = file.name || `upload_${Date.now()}.png`;
      fileBuffer = Buffer.from(await file.arrayBuffer());

    } else {
      const body = await req.json().catch(() => ({}));
      folder = body.folder || 'proofs';
      const base64Data = body.base64 || body.image;

      if (!base64Data) {
        return NextResponse.json({
          success: false,
          error: { code: 'NO_FILE', message: 'No base64 image string provided' }
        }, { status: 400 });
      }

      const matches = base64Data.match(/^data:image\/([a-zA-Z0-9+\-+]+);base64,(.+)$/);
      let ext = '.png';
      let rawBase64 = base64Data;

      if (matches && matches.length === 3) {
        ext = `.${matches[1] === 'jpeg' ? 'jpg' : matches[1]}`;
        rawBase64 = matches[2];
      }

      fileName = body.fileName || `upload_${Date.now()}${ext}`;
      fileBuffer = Buffer.from(rawBase64, 'base64');
    }

    // Validate Subfolder
    const validFolders = ['avatars', 'proofs', 'payment_screenshots'];
    if (!validFolders.includes(folder)) {
      folder = 'proofs';
    }

    // Validate File Size (Max 200 KB)
    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: `File size exceeds maximum limit of 200 KB (Current size: ${(fileBuffer.length / 1024).toFixed(1)} KB)` }
      }, { status: 400 });
    }

    // Validate Extension
    const ext = path.extname(fileName).toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({
        success: false,
        error: { code: 'INVALID_FILE_TYPE', message: `Invalid file extension '${ext}'. Allowed types: .png, .jpg, .jpeg, .webp` }
      }, { status: 400 });
    }

    // Ensure Directory Exists
    const targetDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(targetDir, { recursive: true });

    // Generate Safe Unique File Name
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const targetPath = path.join(targetDir, uniqueFileName);

    // Save File to Disk
    await fs.writeFile(targetPath, fileBuffer);

    const relativeUrl = `/uploads/${folder}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      status: true,
      message: 'File uploaded successfully',
      data: {
        url: relativeUrl,
        file_path: relativeUrl,
        file_name: uniqueFileName,
        size_bytes: fileBuffer.length,
        size_kb: Math.round(fileBuffer.length / 1024)
      }
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
