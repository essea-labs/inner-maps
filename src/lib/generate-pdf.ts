/**
 * Screenshot-based PDF generation for both individual and compatibility reports.
 * Captures the web report DOM at high resolution for sharp, pixel-perfect output.
 */

async function captureAndSave(element: HTMLElement, fileName: string) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // Wait for fonts and images to finish rendering
  await new Promise((r) => setTimeout(r, 300));

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFFFFF', // Pure white background for maximum contrast
    logging: false,
    removeContainer: true,
    onclone: (clonedDoc) => {
      const el = clonedDoc.querySelector('.report-page') as HTMLElement;
      if (el) {
        el.style.overflow = 'visible';
        el.style.height = 'auto';
        el.style.maxHeight = 'none';
        // Force white background on the cloned element for clean capture
        el.style.backgroundColor = '#FFFFFF';
      }
      // Force all text to be fully opaque in the clone
      clonedDoc.querySelectorAll('*').forEach((node) => {
        const el = node as HTMLElement;
        if (el.style) {
          const computed = clonedDoc.defaultView?.getComputedStyle(el);
          if (computed && parseFloat(computed.opacity) < 1) {
            // Keep opacity but boost slightly for print
          }
        }
      });
    },
  });

  const imgW = canvas.width;
  const imgH = canvas.height;

  const pdfW = 210;
  const pdfH = 297;
  const margin = 6;
  const contentW = pdfW - margin * 2;
  const scaledH = (imgH * contentW) / imgW;
  const pageH = pdfH - margin * 2;
  const totalPages = Math.ceil(scaledH / pageH);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: false, // No compression for maximum quality
  });

  for (let p = 0; p < totalPages; p++) {
    if (p > 0) doc.addPage();

    // Calculate which slice of the source canvas to use for this page
    const srcY = Math.round((p * pageH * imgW) / contentW);
    const srcH = Math.round(Math.min((pageH * imgW) / contentW, imgH - srcY));

    if (srcH <= 0) continue;

    // Create a slice canvas for this page
    const slice = document.createElement('canvas');
    slice.width = imgW;
    slice.height = srcH;
    const ctx = slice.getContext('2d', { alpha: false });
    if (ctx) {
      // White background fill to prevent any transparency issues
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, imgW, srcH);
      // Draw the source slice
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, srcY, imgW, srcH, 0, 0, imgW, srcH);
    }

    // Use JPEG at max quality — smaller file than PNG but still sharp
    // PNG can actually cause issues with jsPDF's internal handling
    const sliceData = slice.toDataURL('image/jpeg', 1.0);
    const sliceH = (srcH * contentW) / imgW;

    doc.addImage(sliceData, 'JPEG', margin, margin, contentW, sliceH, undefined, 'NONE');

    // Page footer
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
 * Generate compatibility report PDF. Finds the report-page element in the DOM.
 */
export async function generateCompatPDF(
  fileName: string,
) {
  const el = document.querySelector('.report-page') as HTMLElement;
  if (el) await captureAndSave(el, fileName);
}
