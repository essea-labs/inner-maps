import type { QuizResults } from '@/lib/types';
import {
  TYPE_DEEP_DIVE, ENNEAGRAM_DEEP_DIVE, ATTACHMENT_DEEP_DIVE,
  CONNECTION_DEEP_DIVE, STARSIGN_DEEP_DIVE, generateIntersectionInsights,
} from '@/lib/deep-dive-data';
import { ZODIAC_ELEMENTS } from '@/lib/compatibility';

// Brand colors
const PEACH = '#E8A87C';
const IVORY = '#FFF8F5';
const BROWN = '#2D2217';
const LIGHT_TEXT = '#8B7E74';
const PEACH_PALE = '#F5D5C0';

/**
 * Generate a branded PDF report from quiz results.
 * Dynamically imports jsPDF to avoid increasing bundle size.
 */
export async function generateReport(results: QuizResults, userName: string) {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const r = results;
  const dd = TYPE_DEEP_DIVE[r.cognitiveType];
  const edd = ENNEAGRAM_DEEP_DIVE[r.enneagramType];
  const add = ATTACHMENT_DEEP_DIVE[r.attachmentStyle];
  const cdd = CONNECTION_DEEP_DIVE[r.connectionSorted[0]?.[0]];
  const sdd = r.starSign ? STARSIGN_DEEP_DIVE[r.starSign.sign] : null;
  const intersections = generateIntersectionInsights(r);
  const element = r.starSign ? ZODIAC_ELEMENTS[r.starSign.sign] : '';

  function checkPageBreak(needed: number) {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function addHeading(text: string, size: number = 16) {
    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(BROWN);
    doc.text(text, margin, y);
    y += size * 0.5 + 2;
  }

  function addSubheading(text: string) {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(PEACH);
    doc.text(text, margin, y);
    y += 6;
  }

  function addBody(text: string) {
    checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(BROWN);
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 4.5;
    }
    y += 3;
  }

  function addBullets(items: string[]) {
    for (const item of items) {
      checkPageBreak(6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(BROWN);
      const lines = doc.splitTextToSize(item, contentWidth - 6);
      doc.text('•', margin, y);
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) checkPageBreak(5);
        doc.text(lines[i], margin + 5, y);
        y += 4.5;
      }
    }
    y += 3;
  }

  function addHighlight(label: string, text: string, accentColor: string = PEACH) {
    checkPageBreak(14);
    // Draw left border
    doc.setDrawColor(accentColor);
    doc.setLineWidth(1);
    doc.line(margin, y - 2, margin, y + 10);
    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(accentColor);
    doc.text(label.toUpperCase(), margin + 4, y);
    y += 5;
    // Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(BROWN);
    const lines = doc.splitTextToSize(text, contentWidth - 6);
    for (const line of lines) {
      checkPageBreak(5);
      doc.text(line, margin + 4, y);
      y += 4.5;
    }
    y += 5;
  }

  function addSeparator() {
    y += 4;
    doc.setDrawColor(PEACH_PALE);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  }

  // ===== COVER SECTION =====
  y = 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(PEACH);
  doc.text('INNER MAPS', pageWidth / 2, y, { align: 'center' });
  y += 12;

  doc.setFontSize(24);
  doc.setTextColor(BROWN);
  doc.text(`${userName || 'Your'}'s Inner Maps`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(LIGHT_TEXT);
  doc.text('Your complete 5-dimension personality profile', pageWidth / 2, y, { align: 'center' });
  y += 6;

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(9);
  doc.text(dateStr, pageWidth / 2, y, { align: 'center' });
  y += 16;

  // Summary box
  const summaryItems = [
    ['Personality', r.cognitiveType],
    ['Enneagram', r.enneagramDisplay],
    ['Attachment', r.attachmentStyle],
    ['Connection', r.topConnection],
    ['Star Sign', r.starSign ? `${r.starSign.sign} ${r.starSign.symbol}` : '—'],
  ];

  doc.setDrawColor(PEACH_PALE);
  doc.setFillColor(IVORY);
  doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'FD');
  y += 8;

  for (const [label, value] of summaryItems) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(LIGHT_TEXT);
    doc.text(label, margin + 8, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(BROWN);
    doc.text(value, margin + 45, y);
    y += 7;
  }
  y += 8;

  // ===== 1. PERSONALITY TYPE =====
  doc.addPage();
  y = margin;

  addHeading('Personality Type — Deep Dive', 16);
  if (dd) {
    addHighlight('Your Type', `${r.cognitiveType} — ${r.cognitiveTypeName}`);

    addSubheading('How You Think');
    addBody(dd.think);
    addSubheading('How You Love');
    addBody(dd.love);
    addSubheading('How You Work');
    addBody(dd.work);
    addHighlight('Your Superpower', dd.superpower, '#66BB6A');
    addHighlight('Your Blind Spot', dd.blindspot, PEACH);
  }

  // ===== 2. ENNEAGRAM =====
  doc.addPage();
  y = margin;

  addHeading('Enneagram — Deep Dive', 16);
  if (edd) {
    addHighlight('Your Type', `${r.enneagramDisplay} — ${r.enneagramName}`);

    addSubheading('Core Fear');
    addBody(edd.fear);
    addSubheading('Core Desire');
    addBody(edd.desire);
    addSubheading('Under Stress');
    addBody(edd.stress);
    addSubheading('At Your Best');
    addBody(edd.best);
    addSubheading('Growth Strategies');
    addBullets(edd.strategies);
  }

  // ===== 3. ATTACHMENT STYLE =====
  doc.addPage();
  y = margin;

  addHeading('Attachment Style — Deep Dive', 16);
  if (add) {
    addHighlight('Your Style', r.attachmentStyle);

    addSubheading('Your Triggers');
    addBullets(add.triggers);
    addSubheading('Your Patterns');
    addBullets(add.patterns);
    addSubheading('In Conflict');
    addBody(add.conflict);
    addSubheading('Growth Strategies');
    addBullets(add.strategies);
  }

  // ===== 4. CONNECTION STYLE =====
  doc.addPage();
  y = margin;

  addHeading('Connection Style — Deep Dive', 16);
  if (cdd) {
    addHighlight('Primary Style', r.topConnection);
    if (r.connectionSorted[1]) {
      addHighlight('Secondary Style', r.connectionNames[r.connectionSorted[1][0]]);
    }

    addSubheading('Day to Day');
    addBody(cdd.dayToDay);
    addSubheading('When It\'s Unmet');
    addBody(cdd.unmet);
    addSubheading('How to Ask For It');
    addBody(cdd.askForIt);
  }

  // ===== 5. STAR SIGN =====
  if (sdd && r.starSign) {
    doc.addPage();
    y = margin;

    addHeading('Star Sign — Deep Dive', 16);
    addHighlight('Your Sign', `${r.starSign.sign} ${r.starSign.symbol}`);

    if (sdd.strengths) {
      addSubheading('Strengths');
      addBody(sdd.strengths);
    }
    if (sdd.challenges) {
      addSubheading('Challenges');
      addBody(sdd.challenges);
    }
    if (sdd.practicalInsight) {
      addSubheading('Practical Insight');
      addBody(sdd.practicalInsight);
    }
    if (sdd.element) {
      addSubheading('Element & Energy');
      addBody(`${sdd.element}. ${sdd.season || ''}`);
    }

    const elementTip =
      element === 'fire' ? "Start something bold you've been putting off." :
      element === 'earth' ? 'Slow down and enjoy something sensory — a meal, a walk, a bath.' :
      element === 'air' ? 'Have a conversation that stretches your thinking.' :
      'Spend time near water and let your intuition speak.';
    addHighlight('This Week', elementTip);
  }

  // ===== 6. INTERSECTION INSIGHTS =====
  if (intersections.length > 0) {
    doc.addPage();
    y = margin;

    addHeading('How Your Dimensions Interact', 16);
    addBody('Your personality isn\'t five separate traits — it\'s the way they blend. Here\'s what happens when your dimensions meet.');

    for (let i = 0; i < intersections.length; i++) {
      addSeparator();
      addSubheading(`Insight ${i + 1}`);
      addBody(intersections[i]);
    }
  }

  // ===== FOOTER =====
  y = pageHeight - 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(LIGHT_TEXT);
  doc.text('Generated by Inner Maps — innermaps.io', pageWidth / 2, y, { align: 'center' });
  doc.text('For entertainment and self-reflection only. Not affiliated with MBTI\u00AE.', pageWidth / 2, y + 4, { align: 'center' });

  // Save
  const filename = `${(userName || 'your').toLowerCase().replace(/\s+/g, '-')}-inner-maps-report.pdf`;
  doc.save(filename);
}
