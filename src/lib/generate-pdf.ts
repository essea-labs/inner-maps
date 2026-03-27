import type { QuizResults, CompatibilityResult } from '@/lib/types';
import {
  TYPE_DEEP_DIVE, ENNEAGRAM_DEEP_DIVE, ATTACHMENT_DEEP_DIVE,
  CONNECTION_DEEP_DIVE, STARSIGN_DEEP_DIVE, COMPAT_DEEP,
  generateIntersectionInsights,
} from '@/lib/deep-dive-data';
import { ZODIAC_ELEMENTS } from '@/lib/compatibility';
import { ENNEAGRAM_QS } from '@/lib/quiz-data';

// Brand colors (RGB tuples)
const PEACH: [number, number, number] = [232, 168, 124];
const BROWN: [number, number, number] = [45, 34, 23];
const LIGHT: [number, number, number] = [139, 126, 116];
const GREEN: [number, number, number] = [102, 187, 106];
const DEEP_GREEN: [number, number, number] = [46, 125, 50];
const BG: [number, number, number] = [250, 247, 244];

/**
 * Text-based PDF that mirrors the web report section-for-section.
 * Every heading, paragraph, bullet, and highlight from IndividualReport.tsx is included.
 */
export async function generateReportPDF(
  _element: HTMLElement,
  fileName: string,
  results?: QuizResults,
  userName?: string,
) {
  const { default: jsPDF } = await import('jspdf');

  let r = results;
  let name = userName;
  if (!r || !name) {
    const { useQuizStore } = await import('@/store/quiz-store');
    const s = useQuizStore.getState();
    r = r || s.results!;
    name = name || s.userName || 'Your';
  }
  if (!r) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();   // 297
  const M = 18;
  const CW = W - M * 2;
  let y = M;
  let pg = 1;

  const dd = TYPE_DEEP_DIVE[r.cognitiveType];
  const edd = ENNEAGRAM_DEEP_DIVE[r.enneagramType];
  const add = ATTACHMENT_DEEP_DIVE[r.attachmentStyle];
  const cdd = CONNECTION_DEEP_DIVE[r.connectionSorted[0]?.[0]];
  const sdd = r.starSign ? STARSIGN_DEEP_DIVE[r.starSign.sign] : null;
  const intersections = generateIntersectionInsights(r);
  const element = r.starSign ? ZODIAC_ELEMENTS[r.starSign.sign] : '';

  // ── Layout helpers ────────────────────────────────────────────

  function footer() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...LIGHT);
    doc.text('innermaps.io', W / 2, H - 7, { align: 'center' });
    doc.text(String(pg), W - M, H - 7, { align: 'right' });
  }

  function newPage() {
    footer();
    doc.addPage();
    pg++;
    y = M;
  }

  function need(h: number) {
    if (y + h > H - 14) newPage();
  }

  // Section heading with icon (e.g. "🧠 Personality Type — Deep Dive")
  function sectionTitle(icon: string, text: string) {
    need(18);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...BROWN);
    doc.text(`${icon}  ${text}`, M, y);
    y += 9;
    // Underline
    doc.setDrawColor(...PEACH);
    doc.setLineWidth(0.5);
    doc.line(M, y, M + CW * 0.3, y);
    y += 6;
  }

  // Sub-heading (peach, 11pt)
  function sub(text: string) {
    need(10);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PEACH);
    doc.text(text, M, y);
    y += 6;
  }

  // Body paragraph
  function para(text: string) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BROWN);
    const lines = doc.splitTextToSize(text, CW);
    for (const ln of lines) {
      need(4.5);
      doc.text(ln, M, y);
      y += 4.2;
    }
    y += 4;
  }

  // Bullet list
  function list(items: string[]) {
    for (const item of items) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...BROWN);
      const lines = doc.splitTextToSize(item, CW - 7);
      for (let i = 0; i < lines.length; i++) {
        need(4.5);
        if (i === 0) {
          doc.setTextColor(...PEACH);
          doc.text('•', M + 1, y);
          doc.setTextColor(...BROWN);
        }
        doc.text(lines[i], M + 6, y);
        y += 4.2;
      }
      y += 1;
    }
    y += 3;
  }

  // Highlight box with left accent
  function box(label: string, text: string, accent: [number, number, number] = PEACH, labelColor?: [number, number, number]) {
    const textLines = doc.splitTextToSize(text, CW - 16);
    const bh = 10 + textLines.length * 4.2 + 5;
    need(bh + 2);
    // Background
    doc.setFillColor(...BG);
    doc.roundedRect(M, y, CW, bh, 2, 2, 'F');
    // Left bar
    doc.setFillColor(...accent);
    doc.rect(M, y, 2.5, bh, 'F');
    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...(labelColor || accent));
    doc.text(label.toUpperCase(), M + 7, y + 5);
    // Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BROWN);
    let ty = y + 10;
    for (const ln of textLines) {
      doc.text(ln, M + 7, ty);
      ty += 4.2;
    }
    y += bh + 5;
  }

  // Thin separator
  function sep() {
    y += 2;
    doc.setDrawColor(245, 213, 192);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 5;
  }

  // Small tag/pill
  function tag(text: string, x: number) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    const tw = doc.getTextWidth(text) + 8;
    doc.setFillColor(245, 213, 192);
    doc.roundedRect(x, y - 3, tw, 6, 3, 3, 'F');
    doc.setTextColor(180, 110, 70);
    doc.text(text, x + 4, y + 1);
    return tw + 4;
  }

  // ── COVER PAGE ────────────────────────────────────────────────

  y = 55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PEACH);
  doc.text('✦  I N N E R   M A P S  ✦', W / 2, y, { align: 'center' });
  y += 16;

  doc.setFontSize(24);
  doc.setTextColor(...BROWN);
  doc.text(`${name}'s Inner Maps`, W / 2, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...LIGHT);
  doc.text('Your complete 5-dimension personality profile', W / 2, y, { align: 'center' });
  y += 7;

  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W / 2, y, { align: 'center' });
  y += 22;

  // Summary card
  const rows: [string, string][] = [
    ['Personality', r.cognitiveType],
    ['Enneagram', r.enneagramDisplay],
    ['Attachment', r.attachmentStyle],
    ['Connection', r.topConnection],
    ['Star Sign', r.starSign ? `${r.starSign.sign} ${r.starSign.symbol}` : '—'],
  ];

  const cardX = M + 15;
  const cardW = CW - 30;
  const cardH = rows.length * 9 + 12;
  doc.setFillColor(...BG);
  doc.setDrawColor(245, 213, 192);
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX, y, cardW, cardH, 3, 3, 'FD');
  y += 10;

  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...LIGHT);
    doc.text(label, cardX + 10, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...BROWN);
    doc.text(value, cardX + 42, y);
    y += 9;
  }

  // ── 1. PERSONALITY TYPE ───────────────────────────────────────

  newPage();
  sectionTitle('🧠', 'Personality Type — Deep Dive');
  if (dd) {
    box('Your Type', `${r.cognitiveType} — ${r.cognitiveTypeName}`);
    sub('How You Think');
    para(dd.think);
    sub('How You Love');
    para(dd.love);
    sub('How You Work');
    para(dd.work);
    box('Your Superpower', dd.superpower, GREEN, DEEP_GREEN);
    box('Your Blind Spot', dd.blindspot, PEACH);
  }

  // ── 2. ENNEAGRAM ──────────────────────────────────────────────

  newPage();
  sectionTitle('🔮', 'Enneagram — Deep Dive');
  if (edd) {
    box('Your Type', `${r.enneagramDisplay} — ${r.enneagramName}`);
    sub('Core Fear');
    para(edd.fear);
    sub('Core Desire');
    para(edd.desire);
    sub('Under Stress');
    para(edd.stress);
    sub('At Your Best');
    para(edd.best);
    sub('Growth Strategies');
    list(edd.strategies);
  }

  // ── 3. ATTACHMENT STYLE ───────────────────────────────────────

  newPage();
  sectionTitle('💛', 'Attachment Style — Deep Dive');
  if (add) {
    box('Your Style', r.attachmentStyle);
    sub('Your Triggers');
    list(add.triggers);
    sub('Your Patterns');
    list(add.patterns);
    sub('In Conflict');
    para(add.conflict);
    sub('Growth Strategies');
    list(add.strategies);
  }

  // ── 4. CONNECTION STYLE ───────────────────────────────────────

  newPage();
  sectionTitle('🤝', 'Connection Style — Deep Dive');
  if (cdd) {
    box('Primary', r.topConnection);

    sub('What This Means Day-to-Day');
    para(cdd.dayToDay);
    sub('How to Ask For It');
    para(cdd.askForIt);
    sub('When This Need Isn\'t Met');
    para(cdd.unmet);

    // Full ranking (matches web report)
    sep();
    need(10 + r.connectionSorted.length * 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...PEACH);
    doc.text('YOUR FULL RANKING', M, y);
    y += 6;

    for (const [key, score] of r.connectionSorted) {
      need(7);
      const isTop = key === r.connectionSorted[0][0];
      doc.setFont('helvetica', isTop ? 'bold' : 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...BROWN);
      doc.text(`${isTop ? '★ ' : ''}${r.connectionNames[key]}`, M, y);

      // Score bar
      const barX = M + 55;
      const barW = CW - 70;
      const fill = (score as number) / 4;
      doc.setFillColor(245, 213, 192);
      doc.roundedRect(barX, y - 3, barW, 4, 2, 2, 'F');
      doc.setFillColor(...PEACH);
      doc.roundedRect(barX, y - 3, barW * fill, 4, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...LIGHT);
      doc.text(String(score), barX + barW + 3, y);
      y += 7;
    }
    y += 4;
  }

  // ── 5. STAR SIGN ──────────────────────────────────────────────

  if (sdd && r.starSign) {
    newPage();
    sectionTitle('✦', 'Star Sign — Deep Dive');
    box('Your Sign', `${r.starSign.sign} ${r.starSign.symbol}`);

    // Tags (element + modality)
    need(10);
    let tx = M;
    tx += tag(sdd.element, tx);
    tag(sdd.modality, tx);
    y += 6;

    sub('Your Season');
    para(sdd.season);
    sub('Ruling Planet');
    para(sdd.planet);
    sub('Your Strengths');
    para(sdd.strengths || '');
    sub('Your Growth Edges');
    para(sdd.challenges || '');
    sub('How This Shows Up in Your Life');
    para(sdd.practicalInsight || '');

    const tip =
      element === 'fire' ? "Start something bold you've been putting off." :
      element === 'earth' ? 'Slow down and enjoy something sensory — a meal, a walk, a bath.' :
      element === 'air' ? 'Have a conversation that stretches your thinking.' :
      'Spend time near water and let your intuition speak.';
    box('This Week', tip);
  }

  // ── 6. INTERSECTIONS ──────────────────────────────────────────

  if (intersections.length > 0) {
    newPage();
    sectionTitle('⟡', 'How Your 5 Dimensions Interact');
    para('Your personality isn\'t five separate traits — it\'s the way they blend. Here\'s what happens when your dimensions meet.');
    for (let i = 0; i < intersections.length; i++) {
      sep();
      para(intersections[i]);
    }
  }

  // ── 7. 5 THINGS TO TRY THIS WEEK ─────────────────────────────

  newPage();
  need(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BROWN);
  doc.text('5 Things to Try This Week', W / 2, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...PEACH);
  doc.text('Personalised for you', W / 2, y, { align: 'center' });
  y += 8;

  const tips: string[] = [];
  // Tip 1: cognitive type
  tips.push(
    `As a ${r.cognitiveType}, ${r.cognitiveType[0] === 'I'
      ? 'protect your alone time this week — block 30 minutes of uninterrupted solitude and notice how it recharges you'
      : "reach out to someone you haven't spoken to in a while — your social energy is a gift, use it intentionally"}.`
  );
  // Tip 2: enneagram strategy
  if (edd) tips.push(edd.strategies[0]);
  // Tip 3: attachment strategy
  if (add) tips.push(add.strategies[0]);
  // Tip 4: connection style
  tips.push(
    `Your connection style is ${r.topConnection} — this week, tell someone close to you exactly how they can make you feel loved. Most people want to show up for you; they just need the roadmap.`
  );
  // Tip 5: star sign
  if (r.starSign) {
    const elTip =
      element === 'fire' ? "start something bold you've been putting off" :
      element === 'earth' ? 'slow down and enjoy something sensory — a meal, a walk, a bath' :
      element === 'air' ? 'have a conversation that stretches your thinking' :
      'spend time near water and let your intuition speak';
    tips.push(`Lean into your ${r.starSign.sign} ${element} energy: ${elTip}.`);
  }

  for (let i = 0; i < tips.length; i++) {
    const tipLines = doc.splitTextToSize(tips[i], CW - 14);
    const tipH = 8 + tipLines.length * 4.2 + 4;
    need(tipH + 3);

    // Number circle
    doc.setFillColor(...PEACH);
    doc.circle(M + 4, y + 4, 3.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), M + 4, y + 5.2, { align: 'center' });

    // Tip text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BROWN);
    let ty = y + 2;
    for (const ln of tipLines) {
      doc.text(ln, M + 12, ty);
      ty += 4.2;
    }
    y = ty + 4;
  }

  // ── DISCLAIMER ────────────────────────────────────────────────

  need(16);
  y += 8;
  sep();
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...LIGHT);
  doc.text('This assessment is not affiliated with The Myers-Briggs Company or the MBTI® instrument.', W / 2, y, { align: 'center' });
  doc.text('For entertainment and self-reflection purposes. Not a clinical assessment.', W / 2, y + 3.5, { align: 'center' });

  footer();
  doc.save(fileName);
}

/**
 * Text-based PDF for compatibility reports — mirrors CompatibilityReport.tsx.
 */
export async function generateCompatPDF(
  fileName: string,
  r: QuizResults,
  tr: QuizResults,
  myName: string,
  connName: string,
  compat: CompatibilityResult,
  strengths: string[],
  challenges: string[],
) {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 18;
  const CW = W - M * 2;
  let y = M;
  let pg = 1;

  // Reuse helper functions from individual PDF
  function footer() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...LIGHT);
    doc.text('innermaps.io', W / 2, H - 7, { align: 'center' });
    doc.text(String(pg), W - M, H - 7, { align: 'right' });
  }
  function newPage() { footer(); doc.addPage(); pg++; y = M; }
  function need(h: number) { if (y + h > H - 14) newPage(); }

  function secTitle(icon: string, text: string) {
    need(18); y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...BROWN);
    doc.text(`${icon}  ${text}`, M, y);
    y += 9;
    doc.setDrawColor(...PEACH);
    doc.setLineWidth(0.5);
    doc.line(M, y, M + CW * 0.3, y);
    y += 6;
  }
  function sub(text: string) {
    need(10); y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...PEACH);
    doc.text(text, M, y);
    y += 6;
  }
  function para(text: string) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BROWN);
    for (const ln of doc.splitTextToSize(text, CW)) {
      need(4.5); doc.text(ln, M, y); y += 4.2;
    }
    y += 4;
  }
  function italic(text: string) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...LIGHT);
    for (const ln of doc.splitTextToSize(text, CW)) {
      need(4.5); doc.text(ln, M, y); y += 4.2;
    }
    y += 3;
  }
  function box(label: string, text: string, accent: [number, number, number] = PEACH, labelColor?: [number, number, number]) {
    const lines = doc.splitTextToSize(text, CW - 16);
    const bh = 10 + lines.length * 4.2 + 5;
    need(bh + 2);
    doc.setFillColor(...BG);
    doc.roundedRect(M, y, CW, bh, 2, 2, 'F');
    doc.setFillColor(...accent);
    doc.rect(M, y, 2.5, bh, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...(labelColor || accent));
    doc.text(label.toUpperCase(), M + 7, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BROWN);
    let ty = y + 10;
    for (const ln of lines) { doc.text(ln, M + 7, ty); ty += 4.2; }
    y += bh + 5;
  }
  function sep() {
    y += 2;
    doc.setDrawColor(245, 213, 192);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    y += 5;
  }
  function vsBlock(name1: string, val1: string, name2: string, val2: string) {
    need(16);
    const mid = W / 2;
    // Left
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...LIGHT);
    doc.text(name1, mid - 25, y, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...BROWN);
    doc.text(val1, mid - 25, y + 6, { align: 'center' });
    // &
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...LIGHT);
    doc.text('&', mid, y + 3, { align: 'center' });
    // Right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...LIGHT);
    doc.text(name2, mid + 25, y, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...BROWN);
    doc.text(val2, mid + 25, y + 6, { align: 'center' });
    y += 14;
  }
  function scoreBar(label: string, pct: number) {
    need(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...LIGHT);
    doc.text(label, M, y);
    const barX = M + 30;
    const barW = CW - 45;
    doc.setFillColor(245, 213, 192);
    doc.roundedRect(barX, y - 3, barW, 4, 2, 2, 'F');
    doc.setFillColor(...PEACH);
    doc.roundedRect(barX, y - 3, barW * (pct / 100), 4, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BROWN);
    doc.text(`${pct}%`, barX + barW + 3, y);
    y += 8;
  }

  // Enneagram helper
  function enneagramBrings(type: number, nm: string): string {
    const brings = type <= 3
      ? 'brings drive, structure, and a desire to make things better'
      : type <= 6
      ? 'brings depth, insight, and a unique way of seeing the world'
      : 'brings energy, strength, and a gift for keeping things moving';
    return `As ${ENNEAGRAM_QS[type - 1]?.name}, ${nm} ${brings}.`;
  }
  function commsStyle(cogType: string, nm: string): string {
    return cogType[0] === 'I'
      ? `Give ${nm} space to process before expecting a response. They think deeply — silence doesn't mean disengagement.`
      : `Let ${nm} think out loud. They process by talking, and interrupting can feel like dismissal.`;
  }

  const myConnKey = r.connectionSorted[0]?.[0] || 'quality';
  const theirConnKey = Object.keys(tr.connectionNames).find((k) => tr.connectionNames[k] === tr.topConnection) || 'quality';

  // ── COVER ─────────────────────────────────────────────────

  y = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...PEACH);
  doc.text('✦  I N N E R   M A P S  ✦', W / 2, y, { align: 'center' });
  y += 16;

  doc.setFontSize(22);
  doc.setTextColor(...BROWN);
  doc.text(`${myName} & ${connName}`, W / 2, y, { align: 'center' });
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...LIGHT);
  doc.text('Your complete compatibility across 5 dimensions', W / 2, y, { align: 'center' });
  y += 7;
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W / 2, y, { align: 'center' });
  y += 22;

  // Overall score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(...PEACH);
  doc.text(`${compat.overall}%`, W / 2, y, { align: 'center' });
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...LIGHT);
  doc.text('Overall Compatibility', W / 2, y, { align: 'center' });
  y += 16;

  // Strengths & challenges
  box('💚 Your Biggest Strengths', `Your strongest dimensions are ${strengths[0]} and ${strengths[1]}. These are the areas where you naturally click — lean into them. They're the foundation your connection is built on.`, GREEN, DEEP_GREEN);
  box('⚡ Where to Be Intentional', `Your growth edges are ${challenges[0]} and ${challenges[1]}. These aren't weaknesses — they're invitations. The dimensions where you differ most are where you have the most to teach each other.`, PEACH);

  // ── STAR SIGN ─────────────────────────────────────────────

  newPage();
  secTitle('✦', 'Star Sign Compatibility');
  vsBlock(myName, `${r.starSign?.sign || ''} ${r.starSign?.symbol || ''}`, connName, `${tr.starSign?.sign || ''} ${tr.starSign?.symbol || ''}`);
  scoreBar('Compatibility', compat.zodiac.score);
  italic(compat.zodiac.insight);
  box('Strength', COMPAT_DEEP.zodiac.strength(r.starSign?.sign ?? 'Aries', tr.starSign?.sign ?? 'Aries'), GREEN, DEEP_GREEN);
  box('Watch Out', COMPAT_DEEP.zodiac.watchOut(r.starSign?.sign ?? 'Aries', tr.starSign?.sign ?? 'Aries'), PEACH);

  // ── PERSONALITY ───────────────────────────────────────────

  newPage();
  secTitle('🧠', 'Personality Compatibility');
  vsBlock(myName, r.cognitiveType, connName, tr.cognitiveType);
  scoreBar('Compatibility', compat.personality.score);
  italic(compat.personality.insight);
  sub(`How ${myName} Communicates`);
  para((TYPE_DEEP_DIVE[r.cognitiveType]?.think ?? '').substring(0, 150) + '...');
  sub(`How ${connName} Communicates`);
  para((TYPE_DEEP_DIVE[tr.cognitiveType]?.think ?? '').substring(0, 150) + '...');

  const personalityTip = r.cognitiveType[0] !== tr.cognitiveType[0]
    ? "One of you recharges alone, the other recharges with people. Neither is wrong — create space for both and you'll avoid the most common introvert-extrovert friction."
    : r.cognitiveType[2] !== tr.cognitiveType[2]
    ? "One of you leads with logic, the other with feeling. Neither is wrong — learn to translate between head and heart."
    : 'You share core traits, which means easy communication but also shared blind spots. Push each other into unfamiliar territory.';
  box('Try This', personalityTip);

  // ── ENNEAGRAM ─────────────────────────────────────────────

  newPage();
  secTitle('🔮', 'Enneagram Compatibility');
  vsBlock(myName, r.enneagramDisplay, connName, tr.enneagramDisplay);
  scoreBar('Compatibility', compat.enneagram.score);
  italic(compat.enneagram.insight);
  box(`What ${myName} Brings`, enneagramBrings(r.enneagramType, myName), GREEN, DEEP_GREEN);
  box(`What ${connName} Brings`, enneagramBrings(tr.enneagramType, connName), GREEN, DEEP_GREEN);

  // ── ATTACHMENT ────────────────────────────────────────────

  newPage();
  secTitle('💛', 'Attachment Compatibility');
  vsBlock(myName, r.attachmentStyle, connName, tr.attachmentStyle);
  scoreBar('Compatibility', compat.attachment.score);
  italic(compat.attachment.insight);
  sub('During Conflict');
  para(`${myName}: ${ATTACHMENT_DEEP_DIVE[r.attachmentStyle]?.conflict || ''}`);
  para(`${connName}: ${ATTACHMENT_DEEP_DIVE[tr.attachmentStyle]?.conflict || ''}`);
  const trustTip = r.attachmentStyle === tr.attachmentStyle
    ? "You share the same attachment style, which means you understand each other's needs intuitively. Use that understanding as a foundation — but challenge each other to grow beyond your comfort zone."
    : "Your attachment styles differ, which creates a natural dynamic tension. The key is naming your patterns out loud: \"I'm pulling away because I'm overwhelmed\" or \"I'm reaching out because I need reassurance.\" Transparency turns triggers into connection points.";
  box('To Deepen Trust', trustTip);

  // ── CONNECTION STYLE ──────────────────────────────────────

  newPage();
  secTitle('🤝', 'Connection Style Compatibility');
  vsBlock(myName, r.topConnection, connName, tr.topConnection);
  scoreBar('Compatibility', compat.connection.score);
  italic(compat.connection.insight);
  sub(`How to Show Love to ${myName}`);
  para(CONNECTION_DEEP_DIVE[myConnKey]?.askForIt || '');
  sub(`How to Show Love to ${connName}`);
  para(CONNECTION_DEEP_DIVE[theirConnKey]?.askForIt || '');

  // ── COMMUNICATION GUIDE ───────────────────────────────────

  sep();
  need(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BROWN);
  doc.text('Your Communication Guide', M, y);
  y += 8;

  para(`When ${myName} need${myName !== 'You' ? 's' : ''} to be heard: ${commsStyle(r.cognitiveType, myName)}`);
  para(`When ${connName} needs to be heard: ${commsStyle(tr.cognitiveType, connName)}`);

  const conflictTip = r.attachmentStyle === 'Avoidant' || tr.attachmentStyle === 'Avoidant'
    ? "One of you needs space during tension. Agree on a \"pause and return\" rule — take 20 minutes, then come back."
    : r.attachmentStyle === 'Anxious' || tr.attachmentStyle === 'Anxious'
    ? "One of you needs resolution quickly. Agree on a reassurance signal — \"I'm not going anywhere, I just need a moment.\""
    : "You both handle conflict relatively well. The key is staying curious rather than defensive.";
  para(`During conflict: ${conflictTip}`);

  // ── 5 WAYS TO DEEPEN YOUR CONNECTION ──────────────────────

  newPage();
  need(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BROWN);
  doc.text('5 Ways to Deepen Your Connection', W / 2, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...PEACH);
  doc.text('For both of you', W / 2, y, { align: 'center' });
  y += 8;

  const enneagramNeeds: Record<number, string> = {
    1: 'to feel that things are being done right',
    2: 'to feel appreciated for what they give',
    3: 'to feel valued for who they are, not just what they achieve',
    4: 'to feel seen for their uniqueness',
    5: 'to feel competent and not overwhelmed',
    6: 'to feel safe and supported',
    7: 'to feel free and not boxed in',
    8: 'to feel respected and not controlled',
    9: 'to feel that their voice matters',
  };
  const connectionFeeling: Record<string, string> = {
    'Words of Affirmation': 'appreciated',
    'Acts of Service': 'supported',
    'Gifts': 'thought of',
    'Quality Time': 'valued',
    'Physical Touch': 'close to you',
  };

  const tips = [
    `As ${ENNEAGRAM_QS[r.enneagramType - 1]?.name}, ${myName} needs ${enneagramNeeds[r.enneagramType]}. As ${ENNEAGRAM_QS[tr.enneagramType - 1]?.name}, ${connName} needs ${enneagramNeeds[tr.enneagramType]}. This week, meet the other person's need without mentioning you read this. See if they notice.`,
    `This week, show up in each other's connection style. ${myName}: try ${tr.topConnection.toLowerCase()}. ${connName}: try ${r.topConnection.toLowerCase()}. It won't feel natural. It might even be funny. Both good signs.`,
    `Pick an activity that plays to your strongest compatibility dimension (${strengths[0]}). You're already good at this one — make it a regular thing.`,
    `Ask each other: "What's one thing I do that makes you feel really ${connectionFeeling[r.topConnection] || 'valued'}?" The answer might surprise you.`,
    `Both send your compatibility card to a friend who knows you as a pair. Ask: accurate? Their reaction is usually better than the quiz itself.`,
  ];

  for (let i = 0; i < tips.length; i++) {
    const tipLines = doc.splitTextToSize(tips[i], CW - 14);
    const tipH = 8 + tipLines.length * 4.2 + 4;
    need(tipH + 3);
    // Number circle
    doc.setFillColor(...PEACH);
    doc.circle(M + 4, y + 4, 3.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), M + 4, y + 5.2, { align: 'center' });
    // Tip text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...BROWN);
    let ty = y + 2;
    for (const ln of tipLines) { doc.text(ln, M + 12, ty); ty += 4.2; }
    y = ty + 4;
  }

  // Disclaimer
  need(12); y += 6; sep();
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...LIGHT);
  doc.text('For entertainment and self-reflection purposes. Not a clinical assessment.', W / 2, y, { align: 'center' });

  footer();
  doc.save(fileName);
}

/**
 * Screenshot-based PDF for compatibility reports (complex side-by-side layouts).
 * Uses html2canvas at 3x scale with PNG for sharp output.
 */
export async function generateScreenshotPDF(element: HTMLElement, fileName: string) {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#FFF8F5',
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
