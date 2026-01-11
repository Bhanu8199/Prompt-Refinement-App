import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from '@ffmpeg-installer/ffmpeg';
import { Readable } from 'stream';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic.path);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type FileType = 'text' | 'image' | 'pdf' | 'docx' | 'video' | 'unknown';

export function getFileType(filename: string, mimeType: string): FileType {
  const ext = path.extname(filename).toLowerCase();

  if (mimeType.startsWith('text/') || ['.txt', '.md', '.json'].includes(ext)) {
    return 'text';
  }
  if (mimeType.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.gif', '.bmp'].includes(ext)) {
    return 'image';
  }
  if (mimeType === 'application/pdf' || ext === '.pdf') {
    return 'pdf';
  }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx') {
    return 'docx';
  }
  if (mimeType.startsWith('video/') || ['.mp4', '.avi', '.mov', '.mkv'].includes(ext)) {
    return 'video';
  }
  return 'unknown';
}

export async function extractTextFromFile(filePath: string, fileType: FileType): Promise<string> {
  try {
    // Check if file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error('File does not exist');
    }

    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error('File is empty');
    }

    switch (fileType) {
      case 'text':
        return fs.readFileSync(filePath, 'utf-8');

      case 'image':
        return await extractTextFromImage(filePath);

      case 'pdf':
        return await extractTextFromPDF(filePath);

      case 'docx':
        return await extractTextFromDOCX(filePath);

      case 'video':
        return await extractTextFromVideo(filePath);

      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileType} file:`, error);

    // Provide specific error messages for different failure types
    if (error instanceof Error) {
      if (error.message.includes('File does not exist')) {
        throw new Error('Uploaded file could not be found. Please try uploading again.');
      }
      if (error.message.includes('File is empty')) {
        throw new Error('Uploaded file appears to be empty or corrupted.');
      }
      if (error.message.includes('Unsupported file type')) {
        throw error; // Re-throw as-is
      }
      // Handle specific extraction errors
      if (fileType === 'pdf' && error.message.includes('Invalid PDF')) {
        throw new Error('PDF file appears to be corrupted or invalid.');
      }
      if (fileType === 'docx' && error.message.includes('Invalid')) {
        throw new Error('DOCX file appears to be corrupted or invalid.');
      }
      if (fileType === 'image' && error.message.includes('recognition')) {
        throw new Error('Image file could not be processed. Please ensure it contains readable text.');
      }
    }

    throw new Error(`Failed to extract text from ${fileType} file. The file may be corrupted or in an unsupported format.`);
  }
}

async function extractTextFromImage(filePath: string): Promise<string> {
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(filePath);
    return text;
  } finally {
    await worker.terminate();
  }
}

async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function extractTextFromDOCX(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function extractTextFromVideo(filePath: string): Promise<string> {
  // First, extract audio from video using ffmpeg
  const audioPath = filePath.replace(path.extname(filePath), '.wav');

  await new Promise<void>((resolve, reject) => {
    ffmpeg(filePath)
      .audioCodec('pcm_s16le')
      .audioChannels(1)
      .audioFrequency(16000)
      .output(audioPath)
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });

  try {
    // For now, return a mock transcription since Gemini doesn't have direct audio transcription
    // In production, you might want to use a different service or implement audio processing
    console.log('Video transcription requested - using mock response');
    return "Mock transcription: This is a sample transcription from the video file. In production, implement proper audio transcription service.";
  } finally {
    // Clean up temporary audio file
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }
}
