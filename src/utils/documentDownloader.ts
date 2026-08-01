function escapePdfText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '');
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function generateValidPDFBlob(
  title: string,
  category: string,
  author: string,
  date: string,
  contentSummary: string
): Blob {
  const safeTitle = (title || 'Dokumen KMS').replace(/[^\x20-\x7E]/g, ' ');
  const safeCategory = (category || 'Pengetahuan').replace(/[^\x20-\x7E]/g, ' ');
  const safeAuthor = (author || 'Tim KMS').replace(/[^\x20-\x7E]/g, ' ');
  const safeDate = (date || new Date().toLocaleDateString('id-ID')).replace(/[^\x20-\x7E]/g, ' ');

  const cleanSummary = (contentSummary || 'Ringkasan dokumen pengetahuan KMS Growth Hub 2026.').replace(/[^\x20-\x7E]/g, ' ');
  const lines: string[] = [];
  for (let i = 0; i < cleanSummary.length; i += 65) {
    lines.push(cleanSummary.slice(i, i + 65));
  }

  let streamText = `BT\n/F1 16 Tf\n50 740 Td\n(${escapePdfText(safeTitle.slice(0, 50))}) Tj\n`;
  streamText += `/F1 10 Tf\n0 -24 Td\n(KMS Growth Hub 2026 - Kategori: ${escapePdfText(safeCategory.slice(0, 40))}) Tj\n`;
  streamText += `0 -16 Td\n(Penulis: ${escapePdfText(safeAuthor.slice(0, 30))} | Tanggal: ${escapePdfText(safeDate)}) Tj\n`;
  streamText += `0 -28 Td\n(RINGKASAN & DESKRIPSI DOKUMEN:) Tj\n`;

  lines.slice(0, 18).forEach((line) => {
    streamText += `0 -15 Td\n(${escapePdfText(line)}) Tj\n`;
  });

  streamText += `0 -30 Td\n(Dokumen Resmi Repositori KMS Growth Hub 2026) Tj\nET`;

  const streamLen = streamText.length;

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLen} >>
stream
${streamText}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
00000000115 00000 n 
0000000244 00000 n 
0000000315 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${390 + streamLen}
%%EOF`;

  return new Blob([pdfString], { type: 'application/pdf' });
}

export function generateValidDocxBlob(
  title: string,
  category: string,
  author: string,
  date: string,
  contentSummary: string
): Blob {
  const htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title}</title>
  <style>
    body { font-family: 'Calibri', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
    h1 { color: #006194; border-bottom: 2px solid #006194; padding-bottom: 8px; font-size: 22px; }
    .meta { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; font-size: 13px; color: #475569; margin-bottom: 20px; }
    .content-box { font-size: 14px; color: #0f172a; margin-top: 20px; }
    .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <strong>Kategori:</strong> ${category} &nbsp;|&nbsp; 
    <strong>Penulis:</strong> ${author} &nbsp;|&nbsp; 
    <strong>Tanggal Submisi:</strong> ${date}
  </div>
  <div class="content-box">
    <h3>Isi / Ringkasan Dokumen:</h3>
    <p>${contentSummary}</p>
  </div>
  <div class="footer">
    Dokumen Resmi KMS Growth Hub 2026 - Repositori Pengetahuan
  </div>
</body>
</html>`;
  return new Blob([htmlContent], { type: 'application/msword' });
}

export function generateValidXlsxBlob(
  title: string,
  category: string,
  author: string,
  date: string,
  contentSummary: string
): Blob {
  let csv = '\uFEFF';
  csv += `DOKUMEN HANDOVER / LAPORAN SPREADSHEET KMS GROWTH HUB\n`;
  csv += `Judul Dokumen;${title}\n`;
  csv += `Divisi / Kategori;${category}\n`;
  csv += `Penulis / Kontributor;${author}\n`;
  csv += `Tanggal Submisi;${date}\n\n`;
  csv += `RINGKASAN URAIAN KERJA;\n`;
  csv += `"${contentSummary.replace(/"/g, '""')}"\n`;
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

export function generateValidPptxBlob(
  title: string,
  category: string,
  author: string,
  date: string,
  contentSummary: string
): Blob {
  const htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>${title}</title></head>
<body style="font-family: Arial; padding: 40px; background: #006194; color: white;">
  <h1 style="font-size: 28px;">${title}</h1>
  <p style="font-size: 16px;">Kategori: ${category} | Penulis: ${author} | Tanggal: ${date}</p>
  <div style="background: white; color: #1e293b; padding: 20px; border-radius: 10px; margin-top: 30px;">
    <h2>Ringkasan Presentasi:</h2>
    <p>${contentSummary}</p>
  </div>
</body>
</html>`;
  return new Blob([htmlContent], { type: 'application/vnd.ms-powerpoint' });
}

export function downloadDocumentFile(options: {
  title: string;
  category: string;
  author: string;
  date: string;
  summary: string;
  fileType?: string;
  fileUrl?: string;
  fileBlob?: File | Blob;
  linkUrl?: string;
}): void {
  const { title, category, author, date, summary, fileType, fileUrl, fileBlob, linkUrl } = options;

  // 1. If web link / URL
  if (linkUrl || fileType?.toUpperCase() === 'LINK') {
    const url = linkUrl || fileUrl;
    if (url) {
      window.open(url, '_blank');
      return;
    }
  }

  // 2. If actual File or Blob exists from user upload
  if (fileBlob) {
    const url = URL.createObjectURL(fileBlob);
    const a = document.createElement('a');
    a.href = url;
    const originalName = (fileBlob as File).name;
    const ext = originalName ? originalName.split('.').pop() : (fileType?.toLowerCase() || 'pdf');
    const safeTitle = (title || 'dokumen').toLowerCase().replace(/[^\w-]/g, '_');
    a.download = originalName || `${safeTitle}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  // 3. If direct Data URL or Blob URL exists
  if (fileUrl && (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:'))) {
    const a = document.createElement('a');
    a.href = fileUrl;
    const ext = fileType?.toLowerCase() || 'pdf';
    const safeTitle = (title || 'dokumen').toLowerCase().replace(/[^\w-]/g, '_');
    a.download = `${safeTitle}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // 3b. If remote HTTP/HTTPS URL exists
  if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://'))) {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.target = '_blank';
    const ext = fileType?.toLowerCase() || 'pdf';
    const safeTitle = (title || 'dokumen').toLowerCase().replace(/[^\w-]/g, '_');
    a.download = `${safeTitle}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // 4. Generate appropriate valid binary/formatted Blob dynamically based on type
  const typeUpper = (fileType || 'PDF').toUpperCase();
  let blob: Blob;
  let filenameExt = 'pdf';

  if (typeUpper === 'PDF' || typeUpper.includes('PDF')) {
    blob = generateValidPDFBlob(title, category, author, date, summary);
    filenameExt = 'pdf';
  } else if (typeUpper === 'DOCX' || typeUpper === 'DOC' || typeUpper === 'E-BOOK') {
    blob = generateValidDocxBlob(title, category, author, date, summary);
    filenameExt = 'docx';
  } else if (typeUpper === 'XLSX' || typeUpper === 'XLS' || typeUpper === 'CSV') {
    blob = generateValidXlsxBlob(title, category, author, date, summary);
    filenameExt = 'xlsx';
  } else if (typeUpper === 'PPTX' || typeUpper === 'PPT') {
    blob = generateValidPptxBlob(title, category, author, date, summary);
    filenameExt = 'pptx';
  } else {
    const txtContent = `==================================================
KMS GROWTH HUB 2026 - DOKUMEN PENGETAHUAN
==================================================
Judul: ${title}
Kategori: ${category}
Penulis: ${author}
Tanggal: ${date}

RINGKASAN DOKUMEN:
${summary}

==================================================
Dokumen Resmi KMS Growth Hub 2026
==================================================`;
    blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    filenameExt = 'txt';
  }

  const safeTitle = (title || 'dokumen').toLowerCase().replace(/[^\w-]/g, '_');
  const filename = `${safeTitle}.${filenameExt}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
