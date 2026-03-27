/**
 * Screenshot-style PDF generation using html2canvas + jsPDF.
 * Captures the report DOM as-is and embeds it as images in a PDF.
 */

export async function generateReportPDF(
  element: HTMLElement,
  fileName: string,
) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  // Capture the report element as a canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFF8F5',
    // Give fonts a moment to render
    onclone: (doc) => {
      // Ensure the cloned element is fully visible (no scroll clipping)
      const cloned = doc.querySelector('.report-page') as HTMLElement;
      if (cloned) {
        cloned.style.overflow = 'visible';
        cloned.style.height = 'auto';
      }
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // A4 dimensions in mm
  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10;
  const contentWidth = pdfWidth - margin * 2;

  // Scale image to fit page width
  const scaledHeight = (imgHeight * contentWidth) / imgWidth;

  // Split into pages
  const pageContentHeight = pdfHeight - margin * 2;
  const totalPages = Math.ceil(scaledHeight / pageContentHeight);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) doc.addPage();

    // Calculate which portion of the image to show on this page
    const sourceY = (page * pageContentHeight * imgWidth) / contentWidth;
    const sourceHeight = (pageContentHeight * imgWidth) / contentWidth;

    // Create a temporary canvas for this page's slice
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = imgWidth;
    pageCanvas.height = Math.min(sourceHeight, imgHeight - sourceY);
    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(
        canvas,
        0, sourceY, imgWidth, pageCanvas.height,
        0, 0, imgWidth, pageCanvas.height,
      );
    }

    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.92);
    const pageScaledHeight = (pageCanvas.height * contentWidth) / imgWidth;

    doc.addImage(pageImgData, 'JPEG', margin, margin, contentWidth, pageScaledHeight);

    // Footer on each page
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(139, 126, 116); // LIGHT_TEXT
    doc.text('innermaps.io', pdfWidth / 2, pdfHeight - 5, { align: 'center' });
    doc.text(`${page + 1} / ${totalPages}`, pdfWidth - margin, pdfHeight - 5, { align: 'right' });
  }

  doc.save(fileName);
}
