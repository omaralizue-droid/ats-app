import { extractText, getDocumentProxy } from 'unpdf';
import mammoth from 'mammoth';

/**
 * Supported file types for resume upload.
 */
export const ACCEPTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'] as const;
export const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export interface ParsedDocument {
  text: string;
  fileName: string;
  extension: string;
  pages?: number;
}

function getExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract plain text from a PDF file using unpdf (built on pdfjs-dist).
 * Handles multi-page documents and normalizes whitespace.
 */
async function parsePdf(buffer: ArrayBuffer): Promise<{ text: string; pages: number }> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const pages = pdf.numPages;
  const { text } = await extractText(pdf, { mergePages: true });
  return { text: normalizeText(text), pages };
}

/**
 * Extract plain text from a .docx file using mammoth.
 * mammoth expects a Node Buffer (not a raw ArrayBuffer).
 */
async function parseDocx(buffer: ArrayBuffer): Promise<string> {
  const nodeBuffer = Buffer.from(buffer);
  const result = await mammoth.extractRawText({ buffer: nodeBuffer });
  return normalizeText(result.value || '');
}

/**
 * Legacy .doc files are binary and mammoth does not support them.
 * We attempt a best-effort extraction of readable strings; if that yields
 * too little content we throw a clear, actionable error so the user can
 * convert to .docx or .pdf.
 */
async function parseLegacyDoc(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  // .doc files embed text as a sequence of printable bytes between control
  // characters. This is a rough heuristic extraction.
  let text = '';
  let run = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    // Printable ASCII + common accented latin-1 range
    if ((b >= 0x20 && b <= 0x7e) || b >= 0xa0) {
      run += String.fromCharCode(b);
    } else if (b === 0x0a || b === 0x0d) {
      if (run.length > 2) text += run + '\n';
      run = '';
    } else {
      if (run.length > 2) text += run + ' ';
      run = '';
    }
  }
  if (run.length > 2) text += run;
  text = normalizeText(text);
  if (text.length < 50) {
    throw new Error(
      'Could not extract enough text from this legacy .doc file. Please save it as .docx or .pdf and upload again.',
    );
  }
  return text;
}

/**
 * Parse an uploaded resume File into plain text.
 *
 * Supports:
 *  - .pdf  → unpdf (pdfjs-dist)
 *  - .docx → mammoth
 *  - .doc  → best-effort binary extraction (limited)
 *  - .txt  → raw UTF-8 decode
 *
 * Throws an Error with a user-friendly message if the file type is
 * unsupported, the file is empty, or extraction yields too little text
 * (e.g. a scanned/image-only PDF).
 */
export async function parseFileToText(file: File): Promise<ParsedDocument> {
  const ext = getExtension(file.name);

  if (!ACCEPTED_EXTENSIONS.includes(ext as (typeof ACCEPTED_EXTENSIONS)[number])) {
    throw new Error(
      `Unsupported file type ".${ext}". Please upload a PDF, DOCX, DOC, or TXT file.`,
    );
  }

  if (file.size === 0) {
    throw new Error('The uploaded file is empty.');
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error('File is too large. Maximum size is 15MB.');
  }

  const buffer = await file.arrayBuffer();
  let text = '';
  let pages: number | undefined;

  try {
    switch (ext) {
      case 'pdf': {
        const result = await parsePdf(buffer);
        text = result.text;
        pages = result.pages;
        break;
      }
      case 'docx': {
        text = await parseDocx(buffer);
        break;
      }
      case 'doc': {
        text = await parseLegacyDoc(buffer);
        break;
      }
      case 'txt':
      default: {
        text = normalizeText(new TextDecoder('utf-8').decode(buffer));
        break;
      }
    }
  } catch (err) {
    // Re-throw our friendly errors as-is; wrap unexpected parser errors.
    if (err instanceof Error && err.message.length > 0) {
      throw new Error(
        err.message.includes('Could not extract') || err.message.includes('Unsupported')
          ? err.message
          : `Failed to read this ${ext.toUpperCase()} file. It may be corrupted or password-protected. Please try another file.`,
      );
    }
    throw new Error(`Failed to parse the uploaded ${ext.toUpperCase()} file.`);
  }

  if (!text || text.trim().length < 30) {
    throw new Error(
      ext === 'pdf'
        ? 'Could not extract enough text from this PDF. It may be a scanned image — please upload a text-based PDF or paste the resume as a .txt file.'
        : `Could not extract enough readable text from this ${ext.toUpperCase()} file. Please check the file contents and try again.`,
    );
  }

  return { text, fileName: file.name, extension: ext, pages };
}
