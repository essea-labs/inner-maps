/**
 * Screenshot-based PDF generation for both individual and compatibility reports.
 * Captures the web report DOM at 4x scale with PNG for sharp, pixel-perfect output.
 */

async function captureAndSave(element: HTMLElement, fileName: string) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // Small delay to ensure fonts and images are loaded
  await new Promise((r) => setTimeout(r, 200));

  const canvas = await html2canvas(element, {
    scale: 4,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFF8F5',
    logging: false,
    onclone: (doc) => {
      const el = doc.querySelector('.report-page') as HTMLElement;
      if (el) {
        el.style.overflow = 'visible';
        el.style.height = 'auto';
        el.style.maxHeight = 'none';
      }
    },
  });

  const imgData = canvas.toDataURL('image/png');
  const imgW = canvas.width;
  const imgH = canvas.height;

  const pdfW = 210;
  const pdfH = 297;
  const margin = 6;
  const contentW = pdfW - margin * 2;
  const scaledH = (imgH * contentW) / imgW;
  const pageH = pdfH - margin * 2;
  const totalPages = Math.ceil(scaledH / pageH);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let p = 0; p < totalPages; p++) {
    if (p > 0) doc.addPage();

    const srcY = (p * pageH * imgW) / contentW;
    const srcH = Math.min((pageH * imgW) / contentW, imgH - srcY);

    const slice = document.createElement('canvas');
    slice.width = imgW;
    slice.height = srcH;
    const ctx = slice.getContext('2d');
    if (ctx) ctx.drawImage(canvas, 0, srcY, imgW, srcH, 0, 0, imgW, srcH);

    const sliceData = slice.toDataURL('image/png');
    const sliceH = (srcH * contentW) / imgW;

    doc.addImage(sliceData, 'PNG', margin, margin, contentW, sliceH);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(155, 139, 122);
    doc.text('innermaps.io', pdfW / 2, pdfH - 4, { align: 'center' });
    doc.text(`${p + 1} / ${totalPages}`, pdfW - margin, pdfH - 4, { align: 'right' });
  }

  doc.save(fileName);
}

/**
 * Generate individual report PDF from the report DOM element.
 */
export async function generateReportPDF(
  element: HTMLElement,
  fileName: string,
) {
  await captureAndSave(element, fileName);
}

/**
 * Generate compatibility report PDF. Uses the DOM element directly.
 */
export async function generateCompatPDF(
  fileName: string,
) {
  const el = document.querySelector('.report-page') as HTMLElement;
  if (el) await captureAndSave(el, fileName);
}
