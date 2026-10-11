import path from 'path';
import fs from 'fs/promises';

export const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB max for proofs & documents

/**
 * Save an uploaded file or base64 string to the public/uploads directory.
 * @param {File|Blob|Buffer|string} fileInput - The file from formData or base64 string
 * @param {string} subfolder - Target folder inside uploads (e.g., 'proofs', 'payment_screenshots', 'kyc', 'avatars', 'support')
 * @param {string} [originalName] - Original filename if known
 * @returns {Promise<{ url: string, filePath: string, fileName: string, sizeBytes: number }>}
 */
export async function saveUploadedFile(fileInput, subfolder = 'proofs', originalName = '') {
  if (!fileInput) return null;

  const validFolders = ['avatars', 'proofs', 'payment_screenshots', 'kyc', 'support', 'qr', 'payment_methods', 'methods'];
  const targetFolder = validFolders.includes(subfolder) ? subfolder : 'proofs';

  let fileBuffer = null;
  let ext = '.png';
  let clientName = originalName || '';

  // Case 1: Web File / Blob instance from FormData
  if (typeof fileInput === 'object' && typeof fileInput.arrayBuffer === 'function') {
    clientName = fileInput.name || clientName;
    const detectedExt = path.extname(clientName).toLowerCase();
    if (detectedExt) ext = detectedExt;
    fileBuffer = Buffer.from(await fileInput.arrayBuffer());
  } 
  // Case 2: Buffer
  else if (Buffer.isBuffer(fileInput)) {
    fileBuffer = fileInput;
    if (clientName) {
      const detectedExt = path.extname(clientName).toLowerCase();
      if (detectedExt) ext = detectedExt;
    }
  } 
  // Case 3: Base64 string
  else if (typeof fileInput === 'string' && fileInput.startsWith('data:')) {
    const matches = fileInput.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('png')) ext = '.png';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('pdf')) ext = '.pdf';
      fileBuffer = Buffer.from(matches[2], 'base64');
    } else {
      fileBuffer = Buffer.from(fileInput, 'base64');
    }
  } 
  // Case 4: Already a public URL or path string
  else if (typeof fileInput === 'string') {
    if (fileInput.startsWith('/') || fileInput.startsWith('http://') || fileInput.startsWith('https://')) {
      return {
        url: fileInput,
        filePath: fileInput,
        fileName: path.basename(fileInput),
        sizeBytes: 0
      };
    }
    // Raw base64 string without data prefix
    fileBuffer = Buffer.from(fileInput, 'base64');
  }

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Empty or invalid file payload provided');
  }

  // Validate file size
  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds 5 MB limit (Current: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);
  }

  // Validate extension
  if (!ALLOWED_EXTENSIONS.includes(ext.toLowerCase())) {
    ext = '.png';
  }

  // Ensure directories exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', targetFolder);
  await fs.mkdir(uploadsDir, { recursive: true });

  // Unique filename
  const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
  const fullDiskPath = path.join(uploadsDir, uniqueFileName);

  // Write file to disk
  await fs.writeFile(fullDiskPath, fileBuffer);

  const relativeUrl = `/uploads/${targetFolder}/${uniqueFileName}`;

  return {
    url: relativeUrl,
    filePath: relativeUrl,
    fileName: uniqueFileName,
    sizeBytes: fileBuffer.length
  };
}
