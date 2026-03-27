import type { QuizResults } from '@/lib/types';
import {
  TYPE_DEEP_DIVE, ENNEAGRAM_DEEP_DIVE, ATTACHMENT_DEEP_DIVE,
  CONNECTION_DEEP_DIVE, STARSIGN_DEEP_DIVE, generateIntersectionInsights,
} from '@/lib/deep-dive-data';
import { ZODIAC_ELEMENTS } from '@/lib/compatibility';

// Brand colors (hex → RGB)
const PEACH: [number, number, number] = [232, 168, 124];
const BROWN: [number, number, number] = [45, 34, 23];
const LIGHT: [number, number, number] = [139, 126, 116];
const GREEN: [number, number, number] = [102, 187, 106];

/**
 * Polished text-based PDF with proper heading hierarchy, spacing, and brand styling.
 */
export async function generateReportPDF(
  _element: HTMLElement, // kept for API compat, not used in text approach
  fileName: string,
  results?: QuizResults,
  userName?: string,
) {
  const { default: jsPDF } = await import('jspdf');

  // If results not passed, try to get from store
  let r = results;
  let name = userName;
  if (!r || !name) {
    const { useQuizStore } = await import('@/store/quiz-store');
    const state = useQuizStore.getState();
    r = r || state.results!;
    name = name || state.userName || 'Your';
  }
  if (!r) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 20; // margin
  const CW = W - M * 2; // content width
  let y = M;
  let pageNum = 1;

  const dd = TYPE_DEEP_DIVE[r.cognitiveType];
  const edd = ENNEAGRAM_DEEP_DIVE[r.enneagramType];
  const add = ATTACHMENT_DEEP_DIVE[r.attachmentStyle];
  const cdd = CONNECTION_DEEP_DIVE[r.connectionSorted[0]?.[0]];
  const sdd = r.starSign ? STARSIGN_DEEP_DIVE[r.starSign.sign] : null;
  const intersections = generateIntersectionInsights(r);
  const element = r.starSign ? ZODIAC_ELEMENTS[r.starSign.sign] : '';

  // ── Helpers ──────────────────────────────────────────────────

  function footer() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...LIGHT);
    doc.text('innermaps.io', W / 2, H - 8, { align: 'center' });
    doc.text(`${pageNum}`, W - M, H - 8, { align: 'right' });
  }

  function newPage() {
    footer();
    doc.addPage();
    pageNum++;
    y = M;
  }

  function ensureSpace(needed: number) {
    if (y + needed > H - 16) newPage();
  }

  function heading1(text: string) {
    ensureSpace(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...BROWN);
    doc.text(text, M, y);
    y += 10;
  }

  function heading2(text: string) {
    ensureSpace(12);
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...PEACH);
    doc.text(text, M, y);
    y += 7;
  }

  function body(text: string) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BROWN);
    const lines = doc.splitTextToSize(text, CW);
    for (const line of lines) {
      ensureSpace(5);
      doc.text(line, M, y);
      y += 4.2;
    }
    y += 3;
  }

  function bullets(items: string[]) {
    for (const item of items) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...BROWN);
      const lines = doc.splitTextToSize(item, CW - 6);
      for (let i = 0; i < lines.length; i++) {
        ensureSpace(5);
        if (i === 0) doc.text('•', M, y);
        doc.text(lines[i], M + 5, y);
        y += 4.2;
      }
    }
    y += 3;
  }

  function highlight(label: string, text: string, color: [number, number, number] = PEACH) {
    ensureSpace(16);
    // Background
    const textLines = doc.splitTextToSize(text, CW - 14);
    const boxH = 8 + textLines.length * 4.2 + 4;
    doc.setFillColor(250, 247, 244);
    doc.roundedRect(M, y - 2, CW, boxH, 2, 2, 'F');
    // Left accent
    doc.setFillColor(...color);
    doc.rect(M, y - 2, 2, boxH, 'F');
    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...color);
    doc.text(label.toUpperCase(), M + 6, y + 3);
    y += 8;
    // Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BROWN);
    for (const line of textLines) {
      doc.text(line, M + 6, y);
      y += 4.2;
    }
    y += 6;
  }

  function separator() {
    y += 2;
    doc.setDrawColor(245, 213, 192);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 6;
  }

  // ── COVER ────────────────────────────────────────────────────

  y = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PEACH);
  doc.text('INNER MAPS', W / 2, y, { align: 'center' });
  y += 14;

  doc.setFontSize(22);
  doc.setTextColor(...BROWN);
  const title = `${name}'s Inner Maps`;
  doc.text(title, W / 2, y, { align: 'center' });
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...LIGHT);
  doc.text('Your complete 5-dimension personality profile', W / 2, y, { align: 'center' });
  y += 6;

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(9);
  doc.text(dateStr, W / 2, y, { align: 'center' });
  y += 20;

  // Summary table
  const rows = [
    ['Personality', r.cognitiveType],
    ['Enneagram', r.enneagramDisplay],
    ['Attachment', r.attachmentStyle],
    ['Connection', r.topConnection],
    ['Star Sign', r.starSign ? `${r.starSign.sign} ${r.starSign.symbol}` : '—'],
  ];

  doc.setFillColor(250, 247, 244);
  doc.roundedRect(M + 10, y, CW - 20, rows.length * 8 + 8, 3, 3, 'F');
  y += 8;

  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...LIGHT);
    doc.text(label, M + 18, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...BROWN);
    doc.text(value, M + 55, y);
    y += 8;
  }

  // ── PERSONALITY TYPE ─────────────────────────────────────────

  newPage();

  heading1('Personality Type — Deep Dive');
  if (dd) {
    highlight('Your Type', `${r.cognitiveType} — ${r.cognitiveTypeName}`);
    heading2('How You Think');
    body(dd.think);
    heading2('How You Love');
    body(dd.love);
    heading2('How You Work');
    body(dd.work);
    highlight('Your Superpower', dd.superpower, GREEN);
    highlight('Your Blind Spot', dd.blindspot, PEACH);
  }

  // ── ENNEAGRAM ────────────────────────────────────────────────

  newPage();

  heading1('Enneagram — Deep Dive');
  if (edd) {
    highlight('Your Type', `${r.enneagramDisplay} — ${r.enneagramName}`);
    heading2('Core Fear');
    body(edd.fear);
    heading2('Core Desire');
    body(edd.desire);
    heading2('Under Stress');
    body(edd.stress);
    heading2('At Your Best');
    body(edd.best);
    heading2('Growth Strategies');
    bullets(edd.strategies);
  }

  // ── ATTACHMENT ───────────────────────────────────────────────

  newPage();

  heading1('Attachment Style — Deep Dive');
  if (add) {
    highlight('Your Style', r.attachmentStyle);
    heading2('Your Triggers');
    bullets(add.triggers);
    heading2('Your Patterns');
    bullets(add.patterns);
    heading2('In Conflict');
    body(add.conflict);
    heading2('Growth Strategies');
    bullets(add.strategies);
  }

  // ── CONNECTION STYLE ─────────────────────────────────────────

  newPage();

  heading1('Connection Style — Deep Dive');
  if (cdd) {
    highlight('Primary Style', r.topConnection);
    if (r.connectionSorted[1]) {
      highlight('Secondary Style', r.connectionNames[r.connectionSorted[1][0]]);
    }
    heading2('Day to Day');
    body(cdd.dayToDay);
    heading2('When It\'s Unmet');
    body(cdd.unmet);
    heading2('How to Ask For It');
    body(cdd.askForIt);
  }

  // ── STAR SIGN ────────────────────────────────────────────────

  if (sdd && r.starSign) {
    newPage();
    heading1('Star Sign — Deep Dive');
    highlight('Your Sign', `${r.starSign.sign} ${r.starSign.symbol}`);

    if (sdd.strengths) { heading2('Strengths'); body(sdd.strengths); }
    if (sdd.challenges) { heading2('Challenges'); body(sdd.challenges); }
    if (sdd.practicalInsight) { heading2('Practical Insight'); body(sdd.practicalInsight); }
    if (sdd.element) { heading2('Element & Energy'); body(`${sdd.element}. ${sdd.season || ''}`); }

    const tip =
      element === 'fire' ? "Start something bold you've been putting off." :
      element === 'earth' ? 'Slow down and enjoy something sensory — a meal, a walk, a bath.' :
      element === 'air' ? 'Have a conversation that stretches your thinking.' :
      'Spend time near water and let your intuition speak.';
    highlight('This Week', tip);
  }

  // ── INTERSECTION INSIGHTS ────────────────────────────────────

  if (intersections.length > 0) {
    newPage();
    heading1('How Your Dimensions Interact');
    body('Your personality isn\'t five separate traits — it\'s the way they blend. Here\'s what happens when your dimensions meet.');

    for (let i = 0; i < intersections.length; i++) {
      separator();
      heading2(`Insight ${i + 1}`);
      body(intersections[i]);
    }
  }

  // ── FINAL FOOTER ─────────────────────────────────────────────

  footer();

  // Disclaimer on last page
  ensureSpace(12);
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...LIGHT);
  doc.text('This assessment is not affiliated with The Myers-Briggs Company or the MBTI® instrument.', W / 2, y, { align: 'center' });
  doc.text('For entertainment and self-reflection purposes. Not a clinical assessment.', W / 2, y + 3.5, { align: 'center' });

  doc.save(fileName);
}

/**
 * Screenshot-based PDF for compatibility reports (complex layouts).
 * Uses html2canvas with high quality PNG to avoid blur.
 */
export async function generateScreenshotPDF(element: HTMLElement, fileName: string) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 3, // higher scale for clarity
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFF8F5',
  });

  const imgData = canvas.toDataURL('image/png'); // PNG for no compression artifacts
  const imgW = canvas.width;
  const imgH = canvas.height;

  const pdfW = 210;
  const pdfH = 297;
  const margin = 8;
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
    const sliceScaledH = (srcH * contentW) / imgW;

    doc.addImage(sliceData, 'PNG', margin, margin, contentW, sliceScaledH);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(139, 126, 116);
    doc.text('innermaps.io', pdfW / 2, pdfH - 5, { align: 'center' });
    doc.text(`${p + 1} / ${totalPages}`, pdfW - margin, pdfH - 5, { align: 'right' });
  }

  doc.save(fileName);
}
