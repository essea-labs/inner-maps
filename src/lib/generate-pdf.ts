/**
 * Screenshot-based PDF generation for both individual and compatibility reports.
 * Widens the clone to 800px before capture for print-quality resolution.
 */

async function captureAndSave(element: HTMLElement, fileName: string) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // Wait for fonts and images
  await new Promise((r) => setTimeout(r, 300));

  // The mobile viewport is ~440px. At scale 3 that's only 1320px wide —
  // not enough for sharp A4 print. We widen the clone to 800px and use
  // scale 3 to get 2400px, which maps cleanly to A4 at ~300dpi.
  const printWidth = 800;

  const canvas = await html2canvas(element, {
    scale: 3,
    width: printWidth,
    windowWidth: printWidth,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFF8F5', // Match the app's ivory background
    logging: false,
    removeContainer: true,
    onclone: (clonedDoc, clonedEl) => {
      // ── CRITICAL: Force all animations to end state ──
      // Without this, html2canvas captures elements at animation start
      // (opacity: 0, translateY: 20px, etc.) causing the faded look
      const style = clonedDoc.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
          opacity: 1 !important;
        }
      `;
      clonedDoc.head.appendChild(style);

      // Widen the cloned element to fill the print width
      clonedEl.style.width = `${printWidth}px`;
      clonedEl.style.maxWidth = 'none';
      clonedEl.style.overflow = 'visible';
      clonedEl.style.height = 'auto';
      clonedEl.style.maxHeight = 'none';
      clonedEl.style.backgroundColor = '#FFF8F5';
      clonedEl.style.padding = '24px 32px';

      // Also widen any parent containers that might constrain width
      let parent = clonedEl.parentElement;
      while (parent) {
        parent.style.maxWidth = 'none';
        parent.style.width = `${printWidth}px`;
        parent = parent.parentElement;
      }

      // Remove the download PDF button and save CTA from the clone
      clonedEl.querySelectorAll('button').forEach((btn) => {
        if (btn.textContent?.includes('PDF') || btn.textContent?.includes('Compare')) {
          btn.style.display = 'none';
        }
      });

      // Hide any signup CTAs
      clonedEl.querySelectorAll('[style*="linear-gradient"]').forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });
    },
  });

  const imgW = canvas.width;
  const imgH = canvas.height;

  const pdfW = 210;
  const pdfH = 297;
  const margin = 8;
  const contentW = pdfW - margin * 2;
  const scaledH = (imgH * contentW) / imgW;
  const pageH = pdfH - margin * 2;
  const totalPages = Math.ceil(scaledH / pageH);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: false,
  });

  for (let p = 0; p < totalPages; p++) {
    if (p > 0) doc.addPage();

    const srcY = Math.round((p * pageH * imgW) / contentW);
    const srcH = Math.round(Math.min((pageH * imgW) / contentW, imgH - srcY));
    if (srcH <= 0) continue;

    const slice = document.createElement('canvas');
    slice.width = imgW;
    slice.height = srcH;
    const ctx = slice.getContext('2d', { alpha: false });
    if (ctx) {
      ctx.fillStyle = '#FFF8F5';
      ctx.fillRect(0, 0, imgW, srcH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, srcY, imgW, srcH, 0, 0, imgW, srcH);
    }

    const sliceData = slice.toDataURL('image/jpeg', 1.0);
    const sliceH = (srcH * contentW) / imgW;

    doc.addImage(sliceData, 'JPEG', margin, margin, contentW, sliceH, undefined, 'NONE');

    // Footer
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
 * Generate compatibility report PDF.
 */
export async function generateCompatPDF(
  fileName: string,
) {
  const el = document.querySelector('.report-page') as HTMLElement;
  if (el) await captureAndSave(el, fileName);
}
