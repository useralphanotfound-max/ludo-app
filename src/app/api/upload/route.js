import { NextResponse } from 'next/server';
import { saveUploadedFile, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '@/lib/uploadHelper';

export async function POST(req) {
  try {
    let folder = 'proofs';
    let fileToSave = null;
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

      fileToSave = file;
      fileName = file.name || '';

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

      fileToSave = base64Data;
      fileName = body.fileName || '';
    }

    const savedFile = await saveUploadedFile(fileToSave, folder, fileName);

    return NextResponse.json({
      success: true,
      status: true,
      message: 'File uploaded successfully',
      data: {
        url: savedFile.url,
        file_path: savedFile.filePath,
        file_name: savedFile.fileName,
        size_bytes: savedFile.sizeBytes,
        size_kb: Math.round(savedFile.sizeBytes / 1024)
      }
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    }, { status: 500 });
  }
}
