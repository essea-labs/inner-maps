import type { QuizResults, CompatibilityResult } from '@/lib/types';
import {
  TYPE_DEEP_DIVE, ENNEAGRAM_DEEP_DIVE, ATTACHMENT_DEEP_DIVE,
  CONNECTION_DEEP_DIVE, STARSIGN_DEEP_DIVE, COMPAT_DEEP,
  generateIntersectionInsights,
} from '@/lib/deep-dive-data';
import { ZODIAC_ELEMENTS } from '@/lib/compatibility';
import { ENNEAGRAM_QS } from '@/lib/quiz-data';

// Brand palette
const PEACH: [number, number, number] = [232, 168, 124];
const BROWN: [number, number, number] = [45, 34, 23];
const LIGHT: [number, number, number] = [139, 126, 116];
const GREEN: [number, number, number] = [102, 187, 106];
const DEEP_GREEN: [number, number, number] = [46, 125, 50];
const BG: [number, number, number] = [250, 247, 244];
const WHITE: [number, number, number] = [255, 255, 255];
const PEACH_PALE: [number, number, number] = [245, 213, 192];

// ═══════════════════════════════════════════════════════════════
// Shared PDF layout primitives
// ═══════════════════════════════════════════════════════════════

function createLayout(doc: any) {
  const W = doc.internal.pageSize.getWidth();   // 210
  const H = doc.internal.pageSize.getHeight();  // 297
  const M = 20;       // margin
  const CW = W - M * 2;
  let y = M;
  let pg = 1;

  const _ = {
    get y() { return y; },
    set y(v: number) { y = v; },

    footer() {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...LIGHT);
      doc.text('innermaps.io', W / 2, H - 7, { align: 'center' });
      doc.text(String(pg), W - M, H - 7, { align: 'right' });
    },

    newPage() {
      _.footer();
      doc.addPage();
      pg++;
      y = M;
    },

    need(h: number) {
      if (y + h > H - 16) _.newPage();
    },

    // ── Section heading (18pt bold, peach underline) ──────────────
    h1(text: string) {
      _.need(22);
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...BROWN);
      doc.text(text, M, y);
      y += 4;
      doc.setDrawColor(...PEACH);
      doc.setLineWidth(0.6);
      doc.line(M, y, M + CW * 0.25, y);
      y += 10;
    },

    // ── Sub-heading (12pt bold peach, extra top space) ────────────
    h2(text: string) {
      _.need(14);
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...PEACH);
      doc.text(text, M, y);
      y += 7;
    },

    // ── Body text (9.5pt, generous line height) ──────────────────
    body(text: string) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...BROWN);
      for (const ln of doc.splitTextToSize(text, CW)) {
        _.need(5);
        doc.text(ln, M, y);
        y += 4.5;
      }
      y += 5;
    },

    // ── Italic body (for insights) ───────────────────────────────
    italic(text: string) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(...LIGHT);
      for (const ln of doc.splitTextToSize(text, CW)) {
        _.need(5);
        doc.text(ln, M, y);
        y += 4.5;
      }
      y += 4;
    },

    // ── Bullet list (peach bullets) ──────────────────────────────
    list(items: string[]) {
      for (const item of items) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(...BROWN);
        const lines = doc.splitTextToSize(item, CW - 8);
        for (let i = 0; i < lines.length; i++) {
          _.need(5);
          if (i === 0) {
            doc.setTextColor(...PEACH);
            doc.text('\u2022', M + 1, y);
            doc.setTextColor(...BROWN);
          }
          doc.text(lines[i], M + 7, y);
          y += 4.5;
        }
        y += 2;
      }
      y += 4;
    },

    // ── Highlight box (rounded bg, left accent bar) ──────────────
    box(label: string, text: string, accent: [number, number, number] = PEACH, labelCol?: [number, number, number]) {
      const textLines = doc.splitTextToSize(text, CW - 18);
      const bh = 12 + textLines.length * 4.5 + 6;
      _.need(bh + 4);
      // Background
      doc.setFillColor(...BG);
      doc.roundedRect(M, y, CW, bh, 3, 3, 'F');
      // Left accent bar
      doc.setFillColor(...accent);
      doc.roundedRect(M, y, 3, bh, 1.5, 1.5, 'F');
      // Label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...(labelCol || accent));
      doc.text(label.toUpperCase(), M + 8, y + 6);
      // Body
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...BROWN);
      let ty = y + 12;
      for (const ln of textLines) { doc.text(ln, M + 8, ty); ty += 4.5; }
      y += bh + 6;
    },

    // ── Profile badge (centered rounded pill showing a result) ───
    badge(label: string, value: string) {
      _.need(20);
      const badgeW = Math.max(doc.getTextWidth(value) * 1.8 + 20, 70);
      const bx = (W - badgeW) / 2;
      // Pill background
      doc.setFillColor(...BG);
      doc.setDrawColor(...PEACH_PALE);
      doc.setLineWidth(0.4);
      doc.roundedRect(bx, y, badgeW, 16, 8, 8, 'FD');
      // Label (small, above center)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...LIGHT);
      doc.text(label, W / 2, y + 5, { align: 'center' });
      // Value (bold, center)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...BROWN);
      doc.text(value, W / 2, y + 12, { align: 'center' });
      y += 22;
    },

    // ── Separator line ───────────────────────────────────────────
    sep() {
      y += 3;
      doc.setDrawColor(...PEACH_PALE);
      doc.setLineWidth(0.3);
      doc.line(M, y, W - M, y);
      y += 6;
    },

    // ── Tag pill (inline) ────────────────────────────────────────
    tag(text: string, x: number): number {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const tw = doc.getTextWidth(text) + 8;
      doc.setFillColor(...PEACH_PALE);
      doc.roundedRect(x, y - 3, tw, 6, 3, 3, 'F');
      doc.setTextColor(180, 110, 70);
      doc.text(text, x + 4, y + 1);
      return tw + 4;
    },

    // ── VS block (two values side by side) ───────────────────────
    vs(name1: string, val1: string, name2: string, val2: string) {
      _.need(18);
      const mid = W / 2;
      const spread = 30;
      // Left
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...LIGHT);
      doc.text(name1, mid - spread, y, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...BROWN);
      doc.text(val1, mid - spread, y + 7, { align: 'center' });
      // Ampersand
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...PEACH_PALE);
      doc.text('&', mid, y + 4, { align: 'center' });
      // Right
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...LIGHT);
      doc.text(name2, mid + spread, y, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...BROWN);
      doc.text(val2, mid + spread, y + 7, { align: 'center' });
      y += 16;
    },

    // ── Score bar ────────────────────────────────────────────────
    scoreBar(label: string, pct: number) {
      _.need(10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...LIGHT);
      doc.text(label, M, y);
      const barX = M + 32;
      const barW = CW - 48;
      doc.setFillColor(...PEACH_PALE);
      doc.roundedRect(barX, y - 3, barW, 5, 2.5, 2.5, 'F');
      doc.setFillColor(...PEACH);
      if (pct > 0) doc.roundedRect(barX, y - 3, barW * (pct / 100), 5, 2.5, 2.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...BROWN);
      doc.text(`${pct}%`, barX + barW + 4, y);
      y += 10;
    },

    // ── Numbered tip ─────────────────────────────────────────────
    tip(num: number, text: string) {
      const tipLines = doc.splitTextToSize(text, CW - 16);
      const tipH = tipLines.length * 4.5 + 6;
      _.need(tipH + 6);
      // Number circle
      doc.setFillColor(...PEACH);
      doc.circle(M + 4, y + 4, 3.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...WHITE);
      doc.text(String(num), M + 4, y + 5.2, { align: 'center' });
      // Text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...BROWN);
      let ty = y + 2;
      for (const ln of tipLines) { doc.text(ln, M + 13, ty); ty += 4.5; }
      y = ty + 5;
    },

    // ── Cover branding ───────────────────────────────────────────
    cover(title: string, subtitle: string) {
      y = 60;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...PEACH);
      doc.text('I N N E R   M A P S', W / 2, y, { align: 'center' });
      y += 18;
      doc.setFontSize(24);
      doc.setTextColor(...BROWN);
      doc.text(title, W / 2, y, { align: 'center' });
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...LIGHT);
      doc.text(subtitle, W / 2, y, { align: 'center' });
      y += 6;
      doc.setFontSize(9);
      doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), W / 2, y, { align: 'center' });
      y += 24;
    },

    M, CW, W, H,
  };

  return _;
}


// ═══════════════════════════════════════════════════════════════
// Individual Report PDF
// ═══════════════════════════════════════════════════════════════

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
  const _ = createLayout(doc);

  const dd = TYPE_DEEP_DIVE[r.cognitiveType];
  const edd = ENNEAGRAM_DEEP_DIVE[r.enneagramType];
  const add = ATTACHMENT_DEEP_DIVE[r.attachmentStyle];
  const cdd = CONNECTION_DEEP_DIVE[r.connectionSorted[0]?.[0]];
  const sdd = r.starSign ? STARSIGN_DEEP_DIVE[r.starSign.sign] : null;
  const intersections = generateIntersectionInsights(r);
  const element = r.starSign ? ZODIAC_ELEMENTS[r.starSign.sign] : '';

  // ── COVER ─────────────────────────────────────────────────
  _.cover(`${name}'s Inner Maps`, 'Your complete 5-dimension personality profile');

  // Summary card
  const rows: [string, string][] = [
    ['Personality', r.cognitiveType],
    ['Enneagram', r.enneagramDisplay],
    ['Attachment', r.attachmentStyle],
    ['Connection', r.topConnection],
    ['Star Sign', r.starSign ? `${r.starSign.sign}` : '\u2014'],
  ];
  const cardX = _.M + 20;
  const cardW = _.CW - 40;
  const cardH = rows.length * 10 + 14;
  doc.setFillColor(...BG);
  doc.setDrawColor(...PEACH_PALE);
  doc.setLineWidth(0.4);
  doc.roundedRect(cardX, _.y, cardW, cardH, 4, 4, 'FD');
  _.y += 10;
  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...LIGHT);
    doc.text(label, cardX + 12, _.y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BROWN);
    doc.text(value, cardX + 45, _.y);
    _.y += 10;
  }

  // ── 1. PERSONALITY TYPE ───────────────────────────────────
  _.newPage();
  _.h1('Personality Type');
  if (dd) {
    _.badge('Your Type', `${r.cognitiveType} \u2014 ${r.cognitiveTypeName}`);
    _.h2('How You Think');
    _.body(dd.think);
    _.h2('How You Love');
    _.body(dd.love);
    _.h2('How You Work');
    _.body(dd.work);
    _.box('Your Superpower', dd.superpower, GREEN, DEEP_GREEN);
    _.box('Your Blind Spot', dd.blindspot, PEACH);
  }

  // ── 2. ENNEAGRAM ──────────────────────────────────────────
  _.newPage();
  _.h1('Enneagram');
  if (edd) {
    _.badge('Your Type', `${r.enneagramDisplay} \u2014 ${r.enneagramName}`);
    _.h2('Core Fear');
    _.body(edd.fear);
    _.h2('Core Desire');
    _.body(edd.desire);
    _.h2('Under Stress');
    _.body(edd.stress);
    _.h2('At Your Best');
    _.body(edd.best);
    _.h2('Growth Strategies');
    _.list(edd.strategies);
  }

  // ── 3. ATTACHMENT STYLE ───────────────────────────────────
  _.newPage();
  _.h1('Attachment Style');
  if (add) {
    _.badge('Your Style', r.attachmentStyle);
    _.h2('Your Triggers');
    _.list(add.triggers);
    _.h2('Your Patterns');
    _.list(add.patterns);
    _.h2('In Conflict');
    _.body(add.conflict);
    _.h2('Growth Strategies');
    _.list(add.strategies);
  }

  // ── 4. CONNECTION STYLE ───────────────────────────────────
  _.newPage();
  _.h1('Connection Style');
  if (cdd) {
    _.badge('Primary', r.topConnection);
    _.h2('What This Means Day-to-Day');
    _.body(cdd.dayToDay);
    _.h2('How to Ask For It');
    _.body(cdd.askForIt);
    _.h2('When This Need Isn\'t Met');
    _.body(cdd.unmet);

    // Full ranking
    _.sep();
    _.need(10 + r.connectionSorted.length * 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...PEACH);
    doc.text('YOUR FULL RANKING', _.M, _.y);
    _.y += 8;
    for (const [key, score] of r.connectionSorted) {
      _.need(8);
      const isTop = key === r.connectionSorted[0][0];
      doc.setFont('helvetica', isTop ? 'bold' : 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...BROWN);
      doc.text(`${isTop ? '\u2605 ' : '  '}${r.connectionNames[key]}`, _.M, _.y);
      _.scoreBar('', score as number / 4 * 100);
    }
  }

  // ── 5. STAR SIGN ──────────────────────────────────────────
  if (sdd && r.starSign) {
    _.newPage();
    _.h1('Star Sign');
    _.badge('Your Sign', r.starSign.sign);
    // Tags
    _.need(10);
    let tx = _.M;
    tx += _.tag(sdd.element, tx);
    _.tag(sdd.modality, tx);
    _.y += 8;
    _.h2('Your Season');
    _.body(sdd.season);
    _.h2('Ruling Planet');
    _.body(sdd.planet);
    _.h2('Your Strengths');
    _.body(sdd.strengths || '');
    _.h2('Your Growth Edges');
    _.body(sdd.challenges || '');
    _.h2('How This Shows Up in Your Life');
    _.body(sdd.practicalInsight || '');
    const tip =
      element === 'fire' ? "Start something bold you've been putting off." :
      element === 'earth' ? 'Slow down and enjoy something sensory \u2014 a meal, a walk, a bath.' :
      element === 'air' ? 'Have a conversation that stretches your thinking.' :
      'Spend time near water and let your intuition speak.';
    _.box('This Week', tip);
  }

  // ── 6. INTERSECTIONS ──────────────────────────────────────
  if (intersections.length > 0) {
    _.newPage();
    _.h1('How Your 5 Dimensions Interact');
    _.body('Your personality isn\'t five separate traits \u2014 it\'s the way they blend.');
    for (let i = 0; i < intersections.length; i++) {
      _.sep();
      _.body(intersections[i]);
    }
  }

  // ── 7. 5 THINGS TO TRY ───────────────────────────────────
  _.newPage();
  _.need(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...BROWN);
  doc.text('5 Things to Try This Week', _.W / 2, _.y, { align: 'center' });
  _.y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...PEACH);
  doc.text('Personalised for you', _.W / 2, _.y, { align: 'center' });
  _.y += 10;

  const tips: string[] = [];
  tips.push(`As a ${r.cognitiveType}, ${r.cognitiveType[0] === 'I'
    ? 'protect your alone time this week \u2014 block 30 minutes of uninterrupted solitude and notice how it recharges you'
    : "reach out to someone you haven't spoken to in a while \u2014 your social energy is a gift, use it intentionally"}.`);
  if (edd) tips.push(edd.strategies[0]);
  if (add) tips.push(add.strategies[0]);
  tips.push(`Your connection style is ${r.topConnection} \u2014 this week, tell someone close to you exactly how they can make you feel loved.`);
  if (r.starSign) {
    const elTip = element === 'fire' ? "start something bold you've been putting off" :
      element === 'earth' ? 'slow down and enjoy something sensory' :
      element === 'air' ? 'have a conversation that stretches your thinking' :
      'spend time near water and let your intuition speak';
    tips.push(`Lean into your ${r.starSign.sign} ${element} energy: ${elTip}.`);
  }
  for (let i = 0; i < tips.length; i++) _.tip(i + 1, tips[i]);

  // Disclaimer
  _.need(16); _.y += 6; _.sep();
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...LIGHT);
  doc.text('Not affiliated with The Myers-Briggs Company or the MBTI\u00AE instrument. For entertainment and self-reflection.', _.W / 2, _.y, { align: 'center' });

  _.footer();
  doc.save(fileName);
}


// ═══════════════════════════════════════════════════════════════
// Compatibility Report PDF
// ═══════════════════════════════════════════════════════════════

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
  const _ = createLayout(doc);

  function enneagramBrings(type: number, nm: string): string {
    const b = type <= 3 ? 'brings drive, structure, and a desire to make things better'
      : type <= 6 ? 'brings depth, insight, and a unique way of seeing the world'
      : 'brings energy, strength, and a gift for keeping things moving';
    return `As ${ENNEAGRAM_QS[type - 1]?.name}, ${nm} ${b}.`;
  }
  function commsStyle(cogType: string, nm: string): string {
    return cogType[0] === 'I'
      ? `Give ${nm} space to process before expecting a response. Silence doesn't mean disengagement.`
      : `Let ${nm} think out loud. They process by talking, and interrupting can feel like dismissal.`;
  }
  const myConnKey = r.connectionSorted[0]?.[0] || 'quality';
  const theirConnKey = Object.keys(tr.connectionNames).find((k) => tr.connectionNames[k] === tr.topConnection) || 'quality';

  // ── COVER ─────────────────────────────────────────────────
  _.cover(`${myName} & ${connName}`, 'Your complete compatibility across 5 dimensions');

  // Overall score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  doc.setTextColor(...PEACH);
  doc.text(`${compat.overall}%`, _.W / 2, _.y, { align: 'center' });
  _.y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...LIGHT);
  doc.text('Overall Compatibility', _.W / 2, _.y, { align: 'center' });
  _.y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.text('Compatibility isn\'t about being the same \u2014 it\'s about understanding where you click and where you grow.', _.W / 2, _.y, { align: 'center' });
  _.y += 12;

  _.box('Your Biggest Strengths', `Your strongest dimensions are ${strengths[0]} and ${strengths[1]}. These are the areas where you naturally click \u2014 lean into them.`, GREEN, DEEP_GREEN);
  _.box('Where to Be Intentional', `Your growth edges are ${challenges[0]} and ${challenges[1]}. These aren't weaknesses \u2014 they're invitations to learn from each other.`, PEACH);

  // ── STAR SIGN ─────────────────────────────────────────────
  _.newPage();
  _.h1('Star Sign Compatibility');
  _.vs(myName, `${r.starSign?.sign || ''} ${r.starSign?.symbol || ''}`, connName, `${tr.starSign?.sign || ''} ${tr.starSign?.symbol || ''}`);
  _.scoreBar('Your dynamic', compat.zodiac.score);
  _.italic(compat.zodiac.insight);
  _.box('Strength', COMPAT_DEEP.zodiac.strength(r.starSign?.sign ?? 'Aries', tr.starSign?.sign ?? 'Aries'), GREEN, DEEP_GREEN);
  _.box('Watch Out', COMPAT_DEEP.zodiac.watchOut(r.starSign?.sign ?? 'Aries', tr.starSign?.sign ?? 'Aries'), PEACH);

  // ── PERSONALITY ───────────────────────────────────────────
  _.newPage();
  _.h1('Personality Compatibility');
  _.vs(myName, r.cognitiveType, connName, tr.cognitiveType);
  _.scoreBar('Your dynamic', compat.personality.score);
  _.italic(compat.personality.insight);
  _.h2(`How ${myName} Communicates`);
  _.body((TYPE_DEEP_DIVE[r.cognitiveType]?.think ?? '').substring(0, 150) + '...');
  _.h2(`How ${connName} Communicates`);
  _.body((TYPE_DEEP_DIVE[tr.cognitiveType]?.think ?? '').substring(0, 150) + '...');
  const personalityTip = r.cognitiveType[0] !== tr.cognitiveType[0]
    ? 'One of you recharges alone, the other with people. Create space for both.'
    : r.cognitiveType[2] !== tr.cognitiveType[2]
    ? 'One leads with logic, the other with feeling. Learn to translate between head and heart.'
    : 'You share core traits \u2014 easy communication but also shared blind spots. Push each other.';
  _.box('Try This', personalityTip);

  // ── ENNEAGRAM ─────────────────────────────────────────────
  _.newPage();
  _.h1('Enneagram Compatibility');
  _.vs(myName, r.enneagramDisplay, connName, tr.enneagramDisplay);
  _.scoreBar('Your dynamic', compat.enneagram.score);
  _.italic(compat.enneagram.insight);
  _.box(`What ${myName} Brings`, enneagramBrings(r.enneagramType, myName), GREEN, DEEP_GREEN);
  _.box(`What ${connName} Brings`, enneagramBrings(tr.enneagramType, connName), GREEN, DEEP_GREEN);

  // ── ATTACHMENT ────────────────────────────────────────────
  _.newPage();
  _.h1('Attachment Compatibility');
  _.vs(myName, r.attachmentStyle, connName, tr.attachmentStyle);
  _.scoreBar('Your dynamic', compat.attachment.score);
  _.italic(compat.attachment.insight);
  _.h2('During Conflict');
  _.body(`${myName}: ${ATTACHMENT_DEEP_DIVE[r.attachmentStyle]?.conflict || ''}`);
  _.body(`${connName}: ${ATTACHMENT_DEEP_DIVE[tr.attachmentStyle]?.conflict || ''}`);
  const trustTip = r.attachmentStyle === tr.attachmentStyle
    ? "You share the same attachment style \u2014 you understand each other's needs intuitively. Use that as a foundation, but challenge each other to grow."
    : "Your attachment styles differ. Name your patterns out loud: \"I'm pulling away because I'm overwhelmed\" or \"I'm reaching out because I need reassurance.\"";
  _.box('To Deepen Trust', trustTip);

  // ── CONNECTION STYLE ──────────────────────────────────────
  _.newPage();
  _.h1('Connection Style Compatibility');
  _.vs(myName, r.topConnection, connName, tr.topConnection);
  _.scoreBar('Your dynamic', compat.connection.score);
  _.italic(compat.connection.insight);
  _.h2(`How to Show Love to ${myName}`);
  _.body(CONNECTION_DEEP_DIVE[myConnKey]?.askForIt || '');
  _.h2(`How to Show Love to ${connName}`);
  _.body(CONNECTION_DEEP_DIVE[theirConnKey]?.askForIt || '');

  // ── COMMUNICATION GUIDE ───────────────────────────────────
  _.sep();
  _.h1('Your Communication Guide');
  _.body(`When ${myName} needs to be heard: ${commsStyle(r.cognitiveType, myName)}`);
  _.body(`When ${connName} needs to be heard: ${commsStyle(tr.cognitiveType, connName)}`);
  const conflictTip = r.attachmentStyle === 'Avoidant' || tr.attachmentStyle === 'Avoidant'
    ? 'One of you needs space during tension. Agree on a "pause and return" rule \u2014 take 20 minutes, then come back.'
    : r.attachmentStyle === 'Anxious' || tr.attachmentStyle === 'Anxious'
    ? 'One of you needs resolution quickly. Agree on a reassurance signal before taking any space.'
    : 'You both handle conflict relatively well. Stay curious rather than defensive.';
  _.body(`During conflict: ${conflictTip}`);

  // ── 5 WAYS TO DEEPEN ─────────────────────────────────────
  _.newPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...BROWN);
  doc.text('5 Ways to Deepen Your Connection', _.W / 2, _.y, { align: 'center' });
  _.y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...PEACH);
  doc.text('For both of you', _.W / 2, _.y, { align: 'center' });
  _.y += 10;

  const enneagramNeeds: Record<number, string> = {
    1: 'to feel that things are being done right', 2: 'to feel appreciated for what they give',
    3: 'to feel valued for who they are', 4: 'to feel seen for their uniqueness',
    5: 'to feel competent and not overwhelmed', 6: 'to feel safe and supported',
    7: 'to feel free and not boxed in', 8: 'to feel respected and not controlled',
    9: 'to feel that their voice matters',
  };
  const connectionFeeling: Record<string, string> = {
    'Words of Affirmation': 'appreciated', 'Acts of Service': 'supported',
    'Gifts': 'thought of', 'Quality Time': 'valued', 'Physical Touch': 'close to you',
  };

  _.tip(1, `As ${ENNEAGRAM_QS[r.enneagramType - 1]?.name}, ${myName} needs ${enneagramNeeds[r.enneagramType]}. As ${ENNEAGRAM_QS[tr.enneagramType - 1]?.name}, ${connName} needs ${enneagramNeeds[tr.enneagramType]}. This week, meet the other person's need without mentioning you read this.`);
  _.tip(2, `This week, show up in each other's connection style. ${myName}: try ${tr.topConnection.toLowerCase()}. ${connName}: try ${r.topConnection.toLowerCase()}. It won't feel natural. It might even be funny. Both good signs.`);
  _.tip(3, `Pick an activity that plays to your strongest compatibility dimension (${strengths[0]}). You're already good at this one \u2014 make it a regular thing.`);
  _.tip(4, `Ask each other: "What's one thing I do that makes you feel really ${connectionFeeling[r.topConnection] || 'valued'}?" The answer might surprise you.`);
  _.tip(5, 'Both send your compatibility card to a friend who knows you as a pair. Ask: accurate? Their reaction is usually better than the quiz itself.');

  // Disclaimer
  _.need(12); _.y += 6; _.sep();
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...LIGHT);
  doc.text('For entertainment and self-reflection purposes. Not a clinical assessment.', _.W / 2, _.y, { align: 'center' });

  _.footer();
  doc.save(fileName);
}
