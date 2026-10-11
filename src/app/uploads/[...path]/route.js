import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await params;
    const pathParts = resolvedParams.path;
    if (!pathParts || !Array.isArray(pathParts) || pathParts.length === 0) {
      return new NextResponse('File Not Found', { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', ...pathParts);

    // Security check: ensure path is within public/uploads
    const normalizedTarget = path.normalize(filePath);
    const normalizedBase = path.normalize(path.join(process.cwd(), 'public', 'uploads'));
    if (!normalizedTarget.startsWith(normalizedBase)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const fileBuffer = await fs.readFile(normalizedTarget);
    const ext = path.extname(normalizedTarget).toLowerCase();

    let mimeType = 'application/octet-stream';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.pdf') mimeType = 'application/pdf';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': fileBuffer.length.toString()
      }
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      return new NextResponse('File Not Found', { status: 404 });
    }
    return new NextResponse('Server Error', { status: 500 });
  }
}
