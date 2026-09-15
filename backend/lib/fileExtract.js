// backend/lib/fileExtract.js
//
// Extracts plain text from a variety of uploaded file types so any of them
// can be turned into study material. Handles PDF, Word (.docx), PowerPoint
// (.pptx), Excel (.xlsx/.xls), CSV, and plain text — with explicit UTF-8
// decoding throughout so non-Latin scripts (Korean/Hangul, Japanese,
// Chinese, etc.) come through correctly instead of being mangled.

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const JSZip = require('jszip');

async function extractFromPdf(buffer) {
  const parsed = await pdfParse(buffer);
  return (parsed.text || '').trim();
}

async function extractFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return (result.value || '').trim();
}

function extractFromXlsx(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', codepage: 65001 }); // 65001 = UTF-8
  const parts = [];
  workbook.SheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csv.trim()) parts.push(`Sheet: ${name}\n${csv.trim()}`);
  });
  return parts.join('\n\n').trim();
}

function unescapeXml(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&'); // must be last
}

// .pptx is a zip of XML files; the visible text on each slide lives inside
// <a:t> tags, grouped into paragraphs <a:p> (each paragraph is usually one
// bullet point). We keep paragraph boundaries as newlines so bullet lists
// don't get glued into one giant run-on blob, and decode XML entities
// (&lt; &gt; etc.) back into normal characters.
async function extractFromPptx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)[1], 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)[1], 10);
      return na - nb;
    });

  const slides = [];
  for (const fileName of slideFiles) {
    const xml = await zip.files[fileName].async('string');
    const paragraphXmlBlocks = xml.match(/<a:p>[\s\S]*?<\/a:p>/g) || [];
    const paragraphs = paragraphXmlBlocks
      .map((p) => {
        const texts = [...p.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => unescapeXml(m[1]));
        return texts.join('').trim();
      })
      .filter(Boolean);
    if (paragraphs.length) slides.push(paragraphs);
  }

  return slides
    .map((paragraphs, i) => `Slide ${i + 1}:\n${paragraphs.join('\n')}`)
    .join('\n\n')
    .trim();
}

function extractFromPlainText(buffer) {
  // Explicit utf8 decoding so non-Latin scripts (Hangul, etc.) decode correctly.
  return buffer.toString('utf8').trim();
}

const EXTENSION_HANDLERS = {
  pdf: extractFromPdf,
  docx: extractFromDocx,
  doc: extractFromDocx, // best-effort — old binary .doc isn't fully supported by mammoth
  pptx: extractFromPptx,
  xlsx: extractFromXlsx,
  xls: extractFromXlsx,
  csv: extractFromPlainText,
  txt: extractFromPlainText,
  md: extractFromPlainText,
};

function getExtension(filename) {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename || '');
  return match ? match[1].toLowerCase() : '';
}

async function extractText(buffer, filename) {
  const ext = getExtension(filename);
  const handler = EXTENSION_HANDLERS[ext];
  if (!handler) {
    // Unknown extension: fall back to plain-text decoding as a last resort.
    return extractFromPlainText(buffer);
  }
  return handler(buffer);
}

module.exports = { extractText, getExtension, EXTENSION_HANDLERS };
