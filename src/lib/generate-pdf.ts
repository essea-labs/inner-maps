import type { QuizResults, CompatibilityResult } from '@/lib/types';
import {
  TYPE_DEEP_DIVE, ENNEAGRAM_DEEP_DIVE, ATTACHMENT_DEEP_DIVE,
  CONNECTION_DEEP_DIVE, STARSIGN_DEEP_DIVE, COMPAT_DEEP,
  generateIntersectionInsights,
} from '@/lib/deep-dive-data';
import { ZODIAC_ELEMENTS } from '@/lib/compatibility';
import { ENNEAGRAM_QS } from '@/lib/quiz-data';

// ═══════════════════════════════════════════════════════════════
// Design tokens (matched from reference PDF)
// ═══════════════════════════════════════════════════════════════
const C = {
  brown:    [45,  34,  23]  as [number, number, number],
  peach:    [232, 168, 124] as [number, number, number],
  muted:    [155, 139, 122] as [number, number, number],
  body:     [74,  65,  57]  as [number, number, number],
  subtitle: [107, 92,  77]  as [number, number, number],
  teal:     [13,  148, 136] as [number, number, number],
  bg:       [255, 248, 245] as [number, number, number],
  bgCard:   [250, 245, 240] as [number, number, number],
  white:    [255, 255, 255] as [number, number, number],
  paleP:    [245, 213, 192] as [number, number, number],
};

// ═══════════════════════════════════════════════════════════════
// Layout engine
// ═══════════════════════════════════════════════════════════════
function engine(doc: any) {
  const W = 210, H = 297, M = 22, CW = W - M * 2;
  let y = M, pg = 1;

  const $ = {
    get y() { return y; }, set y(v: number) { y = v; },
    M, CW, W, H,

    // ── Page management ──────────────────────────────────────
    pageHeader(category: string) {
      // Top-left: section category
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C.peach);
      doc.text(category.toUpperCase(), M, 14);
      // Top-right: brand
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      doc.text('INNER MAPS', W - M, 14, { align: 'right' });
      y = 26;
    },
    footer() {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...C.muted);
      doc.text('innermaps.io', M, H - 10);
      doc.text(String(pg), W - M, H - 10, { align: 'right' });
    },
    newPage(category: string) {
      $.footer();
      doc.addPage();
      pg++;
      y = M;
      $.pageHeader(category);
    },
    need(h: number, category?: string) {
      if (y + h > H - 18) $.newPage(category || '');
    },

    // ── Typography ───────────────────────────────────────────
    // Page title (20pt serif)
    title(text: string) {
      $.need(16);
      doc.setFont('times', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...C.brown);
      doc.text(text, M, y);
      y += 12;
    },
    // Result value (15pt serif peach)
    value(text: string) {
      $.need(12);
      doc.setFont('times', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(...C.peach);
      doc.text(text, M, y);
      y += 10;
    },
    // Sub-heading (10.5pt bold sans)
    sub(text: string) {
      $.need(12);
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(...C.brown);
      doc.text(text, M, y);
      y += 7;
    },
    // Small uppercase label (7.5pt muted)
    label(text: string) {
      $.need(8);
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      doc.text(text.toUpperCase(), M, y);
      y += 5;
    },
    // Label value pair (label + bold value on next line)
    labelValue(label: string, value: string) {
      $.need(14);
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      doc.text(label.toUpperCase(), M, y);
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...C.brown);
      const lines = doc.splitTextToSize(value, CW);
      for (const ln of lines) { doc.text(ln, M, y); y += 4.5; }
      y += 3;
    },
    // Body paragraph (9pt)
    body(text: string) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C.body);
      const lines = doc.splitTextToSize(text, CW);
      for (const ln of lines) {
        $.need(5);
        doc.text(ln, M, y);
        y += 4.5;
      }
      y += 5;
    },
    // Italic body
    italic(text: string) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...C.body);
      const lines = doc.splitTextToSize(text, CW);
      for (const ln of lines) { $.need(5); doc.text(ln, M, y); y += 4.5; }
      y += 4;
    },

    // ── Numbered item (circle + bold label + text) ───────────
    numbered(num: number, label: string, text: string) {
      const lines = doc.splitTextToSize(text, CW - 14);
      const h = 6 + lines.length * 4.5 + 4;
      $.need(h + 4);
      // Number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...C.peach);
      doc.text(String(num), M, y);
      // Bold label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...C.brown);
      doc.text(label, M + 8, y);
      y += 6;
      // Body
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C.body);
      for (const ln of lines) { doc.text(ln, M + 8, y); y += 4.5; }
      y += 5;
    },

    // ── Highlight box (uppercase label + body) ───────────────
    highlight(label: string, text: string, color: [number, number, number] = C.peach) {
      const lines = doc.splitTextToSize(text, CW - 16);
      const bh = 8 + lines.length * 4.5 + 8;
      $.need(bh + 4);
      // Background
      doc.setFillColor(...C.bgCard);
      doc.roundedRect(M, y, CW, bh, 2, 2, 'F');
      // Left accent
      doc.setFillColor(...color);
      doc.rect(M, y, 2.5, bh, 'F');
      // Label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...color);
      doc.text(label.toUpperCase(), M + 8, y + 6);
      // Text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C.body);
      let ty = y + 12;
      for (const ln of lines) { doc.text(ln, M + 8, ty); ty += 4.5; }
      y += bh + 5;
    },

    // ── Bullet list ──────────────────────────────────────────
    bullets(items: string[]) {
      for (const item of items) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...C.body);
        const lines = doc.splitTextToSize(item, CW - 8);
        for (let i = 0; i < lines.length; i++) {
          $.need(5);
          if (i === 0) doc.text('\u2022', M + 1, y);
          doc.text(lines[i], M + 7, y);
          y += 4.5;
        }
        y += 2;
      }
      y += 3;
    },

    // ── Separator ────────────────────────────────────────────
    sep() {
      y += 3;
      doc.setDrawColor(...C.paleP);
      doc.setLineWidth(0.3);
      doc.line(M, y, W - M, y);
      y += 6;
    },

    // ── Score bar (compat) ───────────────────────────────────
    scoreBar(pct: number) {
      $.need(10);
      const barW = CW * 0.6;
      const barX = M;
      doc.setFillColor(...C.paleP);
      doc.roundedRect(barX, y - 3, barW, 5, 2.5, 2.5, 'F');
      doc.setFillColor(...C.peach);
      if (pct > 0) doc.roundedRect(barX, y - 3, barW * (pct / 100), 5, 2.5, 2.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C.subtitle);
      doc.text('Your dynamic', barX + barW + 4, y);
      y += 10;
    },

    // ── VS block (compat) ────────────────────────────────────
    vs(name1: string, val1: string, name2: string, val2: string, score: number) {
      $.need(30);
      const col1 = M;
      const col2 = M + CW * 0.55;
      // Name 1
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(name1.toUpperCase(), col1, y);
      // Value 1
      doc.setFont('times', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...C.peach);
      doc.text(val1, col1, y + 8);
      // Score in center
      doc.setFont('times', 'bold');
      doc.setFontSize(28);
      doc.setTextColor(...C.peach);
      doc.text(`${score}%`, W / 2, y + 6, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.subtitle);
      doc.text('Compatibility', W / 2, y + 12, { align: 'center' });
      // Name 2
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(name2.toUpperCase(), col2, y);
      // Value 2
      doc.setFont('times', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...C.peach);
      doc.text(val2, col2, y + 8);
      y += 20;
    },

    // ── Tag pill ─────────────────────────────────────────────
    tag(text: string, x: number, color: [number, number, number] = C.teal): number {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const tw = doc.getTextWidth(text) + 10;
      doc.setFillColor(color[0], color[1], color[2], 0.15);
      doc.setDrawColor(...color);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y - 3.5, tw, 7, 3.5, 3.5, 'FD');
      doc.setTextColor(...color);
      doc.text(text, x + 5, y + 0.5);
      return tw + 4;
    },
  };
  return $;
}


// ═══════════════════════════════════════════════════════════════
// INDIVIDUAL REPORT PDF
// ═══════════════════════════════════════════════════════════════

export async function generateReportPDF(
  _el: HTMLElement, fileName: string, results?: QuizResults, userName?: string,
) {
  const { default: jsPDF } = await import('jspdf');
  let r = results, name = userName;
  if (!r || !name) {
    const { useQuizStore } = await import('@/store/quiz-store');
    const s = useQuizStore.getState();
    r = r || s.results!; name = name || s.userName || 'Your';
  }
  if (!r) return;

  const doc = new jsPDF('portrait', 'mm', 'a4');
  const $ = engine(doc);
  const dd = TYPE_DEEP_DIVE[r.cognitiveType];
  const edd = ENNEAGRAM_DEEP_DIVE[r.enneagramType];
  const add = ATTACHMENT_DEEP_DIVE[r.attachmentStyle];
  const cdd = CONNECTION_DEEP_DIVE[r.connectionSorted[0]?.[0]];
  const sdd = r.starSign ? STARSIGN_DEEP_DIVE[r.starSign.sign] : null;
  const intersections = generateIntersectionInsights(r);
  const element = r.starSign ? ZODIAC_ELEMENTS[r.starSign.sign] : '';

  // ── COVER ─────────────────────────────────────────────────
  $.y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.peach);
  doc.text('INNER MAPS', $.W / 2, $.y, { align: 'center' });
  $.y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), $.W / 2, $.y, { align: 'center' });
  $.y += 14;
  doc.setFont('times', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(...C.brown);
  doc.text(`${name}'s Inner Maps`, $.W / 2, $.y, { align: 'center' });
  $.y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...C.subtitle);
  doc.text('Your complete 5-dimension personality profile', $.W / 2, $.y, { align: 'center' });
  $.y += 20;

  // Summary cards
  const cards: [string, string, string][] = [
    ['PERSONALITY', r.cognitiveType, r.cognitiveTypeName],
    ['ENNEAGRAM', r.enneagramDisplay, r.enneagramName],
    ['ATTACHMENT', r.attachmentStyle, ''],
    ['CONNECTION', r.topConnection, 'Primary love language'],
    ['STAR SIGN', r.starSign?.sign || '\u2014', r.starSign ? `${ZODIAC_ELEMENTS[r.starSign.sign]} ${STARSIGN_DEEP_DIVE[r.starSign.sign]?.modality || ''}` : ''],
  ];
  for (const [label, val, desc] of cards) {
    $.need(20);
    $.sep();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.peach);
    doc.text(label, $.M, $.y);
    $.y += 7;
    doc.setFont('times', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(...C.brown);
    doc.text(val, $.M, $.y);
    if (desc) {
      $.y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C.subtitle);
      doc.text(desc, $.M, $.y);
    }
    $.y += 6;
  }

  // ── PERSONALITY TYPE ──────────────────────────────────────
  $.newPage('Personality Type');
  $.title('Your Type');
  $.value(`${r.cognitiveType} - ${r.cognitiveTypeName}`);
  if (dd) {
    $.sub('How You Think');  $.body(dd.think);
    $.sub('How You Love');   $.body(dd.love);
    $.sub('How You Work');   $.body(dd.work);
    $.highlight('Your Superpower', dd.superpower, C.teal);
    $.highlight('Your Blind Spot', dd.blindspot, C.peach);
  }

  // ── ENNEAGRAM ─────────────────────────────────────────────
  $.newPage('Enneagram');
  $.title('Your Type');
  $.value(`${r.enneagramDisplay} - ${r.enneagramName}`);
  if (edd) {
    $.labelValue('Core Fear', edd.fear);
    $.labelValue('Core Desire', edd.desire);
    $.sub('Under Stress');  $.body(edd.stress);
    $.sub('At Your Best');  $.body(edd.best);
    $.sub('Growth Strategies');
    edd.strategies.forEach((s: string, i: number) => {
      const parts = s.split(/[.\u2014\u2013\-](.+)/);
      $.numbered(i + 1, parts[0]?.trim() || 'Strategy', parts[1]?.trim() || s);
    });
  }

  // ── ATTACHMENT STYLE ──────────────────────────────────────
  $.newPage('Attachment Style');
  $.title('Your Style');
  $.value(r.attachmentStyle);
  if (add) {
    $.sub('Your Triggers');   $.bullets(add.triggers);
    $.sub('Your Patterns');   $.bullets(add.patterns);
    $.sub('In Conflict');     $.body(add.conflict);
    $.sub('Growth Strategies');
    add.strategies.forEach((s: string, i: number) => $.numbered(i + 1, '', s));
  }

  // ── CONNECTION STYLE ──────────────────────────────────────
  $.newPage('Connection Style');
  $.title('Primary');
  $.value(r.topConnection);
  if (cdd) {
    $.sub('What This Means Day-to-Day'); $.body(cdd.dayToDay);
    $.sub('How to Ask For It');          $.body(cdd.askForIt);
    $.sub('When This Need Isn\'t Met');  $.body(cdd.unmet);
    // Ranking
    $.sep();
    $.label('Your Full Ranking');
    for (const [key, score] of r.connectionSorted) {
      $.need(8);
      const isTop = key === r.connectionSorted[0][0];
      doc.setFont('helvetica', isTop ? 'bold' : 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...C.brown);
      doc.text(`${isTop ? '\u2605 ' : '  '}${r.connectionNames[key]}`, $.M, $.y);
      const barX = $.M + 55, barW = $.CW - 68;
      doc.setFillColor(...C.paleP);
      doc.roundedRect(barX, $.y - 3, barW, 4.5, 2, 2, 'F');
      doc.setFillColor(...C.peach);
      doc.roundedRect(barX, $.y - 3, barW * ((score as number) / 4), 4.5, 2, 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(`${((score as number) / 4 * 100).toFixed(0)}%`, barX + barW + 3, $.y);
      $.y += 8;
    }
  }

  // ── STAR SIGN ─────────────────────────────────────────────
  if (sdd && r.starSign) {
    $.newPage('Star Sign');
    $.title(r.starSign.sign);
    // Tags
    $.need(10);
    let tx = $.M;
    tx += $.tag(sdd.element, tx);
    $.tag(sdd.modality, tx);
    $.y += 8;
    $.sub('Your Season');           $.body(sdd.season);
    $.sub('Ruling Planet');         $.body(sdd.planet);
    $.sub('Your Strengths');        $.body(sdd.strengths || '');
    $.sub('Your Growth Edges');     $.body(sdd.challenges || '');
    $.sub('How This Shows Up in Your Life'); $.body(sdd.practicalInsight || '');
    const tip = element === 'fire' ? "Start something bold you've been putting off." :
      element === 'earth' ? 'Slow down and enjoy something sensory \u2014 a meal, a walk, a bath.' :
      element === 'air' ? 'Have a conversation that stretches your thinking.' :
      'Spend time near water and let your intuition speak.';
    $.highlight('This Week', tip);
  }

  // ── DIMENSIONS INTERACTION ────────────────────────────────
  if (intersections.length > 0) {
    $.newPage('Dimensions Interaction');
    $.title('How Your 5 Dimensions Interact');
    $.body('Your personality isn\'t five separate traits \u2014 it\'s the way they blend.');
    for (const ins of intersections) { $.sep(); $.body(ins); }
  }

  // ── 5 THINGS TO TRY ──────────────────────────────────────
  $.newPage('Actions');
  $.title('5 Things to Try This Week');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text('Personalised for you', $.M, $.y); $.y += 8;

  const tips: [string, string][] = [];
  tips.push([r.cognitiveType, `As an ${r.cognitiveType}, ${r.cognitiveType[0] === 'I'
    ? 'protect your alone time this week \u2014 block 30 minutes of uninterrupted solitude and notice how it recharges you'
    : "reach out to someone you haven't spoken to in a while \u2014 your social energy is a gift, use it intentionally"}.`]);
  if (edd) tips.push([`Enneagram ${r.enneagramType}`, edd.strategies[0]]);
  if (add) tips.push(['Attachment', add.strategies[0]]);
  tips.push(['Connection', `Your connection style is ${r.topConnection} \u2014 this week, tell someone close to you exactly how they can make you feel loved.`]);
  if (r.starSign) {
    const et = element === 'fire' ? "start something bold you've been putting off" :
      element === 'earth' ? 'slow down and enjoy something sensory' :
      element === 'air' ? 'have a conversation that stretches your thinking' :
      'spend time near water and let your intuition speak';
    tips.push([r.starSign.sign, `Lean into your ${r.starSign.sign} ${element} energy: ${et}.`]);
  }
  tips.forEach(([lbl, txt], i) => $.numbered(i + 1, lbl, txt));

  // Disclaimer
  $.need(12); $.y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text('Not affiliated with The Myers-Briggs Company or the MBTI\u00AE instrument. For entertainment and self-reflection.', $.W / 2, $.y, { align: 'center' });

  $.footer();
  doc.save(fileName);
}


// ═══════════════════════════════════════════════════════════════
// COMPATIBILITY REPORT PDF
// ═══════════════════════════════════════════════════════════════

export async function generateCompatPDF(
  fileName: string, r: QuizResults, tr: QuizResults,
  myName: string, connName: string,
  compat: CompatibilityResult, strengths: string[], challenges: string[],
) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const $ = engine(doc);

  const myConnKey = r.connectionSorted[0]?.[0] || 'quality';
  const theirConnKey = Object.keys(tr.connectionNames).find((k) => tr.connectionNames[k] === tr.topConnection) || 'quality';

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

  // ── COVER ─────────────────────────────────────────────────
  $.y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...C.peach);
  doc.text('INNER MAPS', $.W / 2, $.y, { align: 'center' });
  $.y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), $.W / 2, $.y, { align: 'center' });
  $.y += 14;
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...C.brown);
  doc.text(`${myName} & ${connName}`, $.W / 2, $.y, { align: 'center' });
  $.y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...C.subtitle);
  doc.text('Your complete compatibility across 5 dimensions', $.W / 2, $.y, { align: 'center' });
  $.y += 20;

  // Overall score
  doc.setFont('times', 'bold');
  doc.setFontSize(48);
  doc.setTextColor(...C.peach);
  doc.text(`${compat.overall}%`, $.W / 2, $.y, { align: 'center' });
  $.y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...C.subtitle);
  doc.text('Overall Compatibility', $.W / 2, $.y, { align: 'center' });
  $.y += 16;

  // Strengths & challenges
  $.highlight('Your Biggest Strengths', `Your strongest dimensions are ${strengths[0]} and ${strengths[1]}. These are the areas where you naturally click \u2014 lean into them.`, C.teal);
  // Strength tags
  $.need(10);
  let sx = $.M;
  sx += $.tag(strengths[0], sx); $.tag(strengths[1], sx);
  $.y += 10;

  $.highlight('Where to Be Intentional', `Your growth edges are ${challenges[0]} and ${challenges[1]}. These aren't weaknesses \u2014 they're invitations to learn from each other.`, C.peach);

  // ── STAR SIGN ─────────────────────────────────────────────
  $.newPage('Star Sign Compatibility');
  $.vs(myName, `${r.starSign?.sign || ''}`, connName, `${tr.starSign?.sign || ''}`, compat.zodiac.score);
  $.italic(compat.zodiac.insight);
  $.highlight('Strength', COMPAT_DEEP.zodiac.strength(r.starSign?.sign ?? 'Aries', tr.starSign?.sign ?? 'Aries'), C.teal);
  $.highlight('Watch Out', COMPAT_DEEP.zodiac.watchOut(r.starSign?.sign ?? 'Aries', tr.starSign?.sign ?? 'Aries'), C.peach);

  // ── PERSONALITY ───────────────────────────────────────────
  $.newPage('Personality Compatibility');
  $.vs(myName, r.cognitiveType, connName, tr.cognitiveType, compat.personality.score);
  $.italic(compat.personality.insight);
  $.sub(`How ${myName} Communicates`);
  $.body((TYPE_DEEP_DIVE[r.cognitiveType]?.think ?? '').substring(0, 200) + '...');
  $.sub(`How ${connName} Communicates`);
  $.body((TYPE_DEEP_DIVE[tr.cognitiveType]?.think ?? '').substring(0, 200) + '...');
  const pTip = r.cognitiveType[0] !== tr.cognitiveType[0]
    ? 'One recharges alone, the other with people. Create space for both.'
    : r.cognitiveType[2] !== tr.cognitiveType[2]
    ? 'One leads with logic, the other with feeling. Learn to translate between head and heart.'
    : 'You share core traits \u2014 easy communication but also shared blind spots. Push each other.';
  $.highlight('Try This', pTip);

  // ── ENNEAGRAM ─────────────────────────────────────────────
  $.newPage('Enneagram Compatibility');
  $.vs(myName, `${r.enneagramDisplay}`, connName, `${tr.enneagramDisplay}`, compat.enneagram.score);
  $.italic(compat.enneagram.insight);
  $.highlight(`What ${myName} Brings`, enneagramBrings(r.enneagramType, myName), C.teal);
  $.highlight(`What ${connName} Brings`, enneagramBrings(tr.enneagramType, connName), C.teal);

  // ── ATTACHMENT ────────────────────────────────────────────
  $.newPage('Attachment Compatibility');
  $.vs(myName, r.attachmentStyle, connName, tr.attachmentStyle, compat.attachment.score);
  $.italic(compat.attachment.insight);
  $.sub('During Conflict');
  $.body(`${myName}: ${ATTACHMENT_DEEP_DIVE[r.attachmentStyle]?.conflict || ''}`);
  $.body(`${connName}: ${ATTACHMENT_DEEP_DIVE[tr.attachmentStyle]?.conflict || ''}`);
  const trust = r.attachmentStyle === tr.attachmentStyle
    ? "You share the same attachment style \u2014 you understand each other's needs intuitively. Use that as a foundation, but challenge each other to grow."
    : "Your attachment styles differ. Name your patterns out loud: \"I'm pulling away because I'm overwhelmed\" or \"I'm reaching out because I need reassurance.\"";
  $.highlight('To Deepen Trust', trust);

  // ── CONNECTION STYLE ──────────────────────────────────────
  $.newPage('Connection Style Compatibility');
  $.vs(myName, r.topConnection, connName, tr.topConnection, compat.connection.score);
  $.italic(compat.connection.insight);
  $.sub(`How to Show Love to ${myName}`);
  $.body(CONNECTION_DEEP_DIVE[myConnKey]?.askForIt || '');
  $.sub(`How to Show Love to ${connName}`);
  $.body(CONNECTION_DEEP_DIVE[theirConnKey]?.askForIt || '');

  // Communication guide
  $.sep();
  $.sub('Your Communication Guide');
  $.body(`When ${myName} needs to be heard: ${commsStyle(r.cognitiveType, myName)}`);
  $.body(`When ${connName} needs to be heard: ${commsStyle(tr.cognitiveType, connName)}`);
  const cTip = r.attachmentStyle === 'Avoidant' || tr.attachmentStyle === 'Avoidant'
    ? 'One of you needs space during tension. Agree on a "pause and return" rule.'
    : r.attachmentStyle === 'Anxious' || tr.attachmentStyle === 'Anxious'
    ? 'One of you needs resolution quickly. Agree on a reassurance signal before taking space.'
    : 'You both handle conflict relatively well. Stay curious rather than defensive.';
  $.body(`During conflict: ${cTip}`);

  // ── 5 WAYS TO DEEPEN ─────────────────────────────────────
  $.newPage('Actions');
  $.title('5 Ways to Deepen Your Connection');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text('For both of you', $.M, $.y); $.y += 8;

  const needs: Record<number, string> = {
    1:'to feel that things are being done right', 2:'to feel appreciated for what they give',
    3:'to feel valued for who they are', 4:'to feel seen for their uniqueness',
    5:'to feel competent and not overwhelmed', 6:'to feel safe and supported',
    7:'to feel free and not boxed in', 8:'to feel respected and not controlled',
    9:'to feel that their voice matters',
  };
  const feel: Record<string, string> = {
    'Words of Affirmation':'appreciated', 'Acts of Service':'supported',
    'Gifts':'thought of', 'Quality Time':'valued', 'Physical Touch':'close to you',
  };

  $.numbered(1, '', `As ${ENNEAGRAM_QS[r.enneagramType-1]?.name}, ${myName} needs ${needs[r.enneagramType]}. As ${ENNEAGRAM_QS[tr.enneagramType-1]?.name}, ${connName} needs ${needs[tr.enneagramType]}. This week, meet the other person's need without mentioning you read this.`);
  $.numbered(2, '', `This week, show up in each other's connection style. ${myName}: try ${tr.topConnection.toLowerCase()}. ${connName}: try ${r.topConnection.toLowerCase()}. It won't feel natural. It might even be funny. Both good signs.`);
  $.numbered(3, '', `Pick an activity that plays to your strongest compatibility dimension (${strengths[0]}). You're already good at this one \u2014 make it a regular thing.`);
  $.numbered(4, '', `Ask each other: "What's one thing I do that makes you feel really ${feel[r.topConnection] || 'valued'}?" The answer might surprise you.`);
  $.numbered(5, '', 'Both send your compatibility card to a friend who knows you as a pair. Ask: accurate? Their reaction is usually better than the quiz itself.');

  $.need(10); $.y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text('For entertainment and self-reflection purposes. Not a clinical assessment.', $.W / 2, $.y, { align: 'center' });

  $.footer();
  doc.save(fileName);
}
