import type { CompatDimension, CompatibilityResult, Connection, QuizResults } from './types';
import { ENNEAGRAM_QS } from './quiz-data';

// ===== ZODIAC COMPATIBILITY DATA =====
export const COMPAT_ZODIAC: Record<string, { score: number; insight: string }> = {
  'same': { score: 75, insight: "Same sign energy — you instantly get each other's rhythms, but watch out for mirroring each other's blind spots." },
  'fire-fire': { score: 82, insight: "Double fire. You fuel each other's ambition and passion, but give space before the sparks turn into a wildfire." },
  'earth-earth': { score: 80, insight: "Grounded together. You build something real and lasting, brick by brick. Just don't let routine replace romance." },
  'air-air': { score: 78, insight: "Two minds in constant motion. The conversations never end — but make sure you land somewhere together." },
  'water-water': { score: 85, insight: "Emotionally in sync on a level most people can't reach. You feel each other without words." },
  'air-fire': { score: 88, insight: "Fire and air — you fan each other's flames. Exciting, stimulating, and never boring." },
  'earth-water': { score: 86, insight: "Earth and water — you nurture and ground each other. A naturally supportive, deeply caring dynamic." },
  'earth-fire': { score: 62, insight: "Fire meets earth — one wants to charge ahead, the other wants a plan. Different speeds, but you balance each other." },
  'fire-water': { score: 58, insight: "Steam. Intense chemistry but you process the world in very different ways. Empathy is the bridge." },
  'air-earth': { score: 60, insight: "One lives in the practical, the other in the possible. You'll challenge each other to grow." },
  'air-water': { score: 65, insight: "Head meets heart. You think differently but that's what makes the conversation so rich." },
};

export const ZODIAC_ELEMENTS: Record<string, string> = {
  'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
  'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
  'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
  'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water',
};

// Sign-specific traits used to generate richer compatibility detail
export const SIGN_TRAITS: Record<string, { brings: string; style: string; edge: string }> = {
  'Aries': { brings: 'directness, initiative, and fearless energy', style: 'acts fast, speaks honestly, leads from the front', edge: 'can be impulsive and steamroll slower-paced people' },
  'Taurus': { brings: 'reliability, patience, and grounded calm', style: 'shows up consistently, values comfort and quality', edge: 'resists change and can dig in when challenged' },
  'Gemini': { brings: 'curiosity, adaptability, and quick wit', style: 'keeps things light and interesting, connects ideas', edge: 'can be scattered and hard to pin down emotionally' },
  'Cancer': { brings: 'emotional depth, loyalty, and nurturing instincts', style: 'creates safety, remembers the details that matter', edge: 'can withdraw when hurt instead of speaking up' },
  'Leo': { brings: 'warmth, confidence, and infectious enthusiasm', style: 'makes people feel special, leads with generosity', edge: 'needs recognition and can dominate without realising' },
  'Virgo': { brings: 'thoughtfulness, precision, and quiet devotion', style: 'shows love through acts of service, notices everything', edge: 'can be overly critical of themselves and others' },
  'Libra': { brings: 'diplomacy, fairness, and an eye for harmony', style: 'smooths conflict, makes everyone feel included', edge: 'avoids confrontation and can be indecisive under pressure' },
  'Scorpio': { brings: 'intensity, loyalty, and emotional courage', style: 'goes deep, sees through pretence, commits fully', edge: 'holds grudges and can be possessive when insecure' },
  'Sagittarius': { brings: 'optimism, honesty, and expansive thinking', style: 'brings adventure and big-picture perspective', edge: 'can be blunt and restless with routine' },
  'Capricorn': { brings: 'discipline, dependability, and quiet ambition', style: 'builds for the long term, earns trust through action', edge: 'can prioritise achievement over emotional connection' },
  'Aquarius': { brings: 'originality, fairness, and independent thinking', style: 'challenges conventions, values authenticity', edge: 'can seem emotionally detached to those closest to them' },
  'Pisces': { brings: 'empathy, creativity, and intuitive understanding', style: 'feels what others feel, brings compassion naturally', edge: 'can lose boundaries and absorb others\' stress' },
};

// ===== COMPATIBILITY FUNCTIONS =====
export function getZodiacCompat(sign1: string, sign2: string): CompatDimension {
  const base = sign1 === sign2
    ? COMPAT_ZODIAC['same']
    : (COMPAT_ZODIAC[[ZODIAC_ELEMENTS[sign1], ZODIAC_ELEMENTS[sign2]].sort().join('-')] || COMPAT_ZODIAC['earth-fire']);
  const t1 = SIGN_TRAITS[sign1], t2 = SIGN_TRAITS[sign2];
  let detail = '';
  if (sign1 === sign2) {
    detail = `Two ${sign1}s means you both bring ${t1.brings}. You get each other instantly — you share the same rhythms and the same blind spots. The growth comes from challenging each other rather than just mirroring.`;
  } else {
    detail = `${sign1} brings ${t1.brings} — someone who ${t1.style}. ${sign2} brings ${t2.brings} — someone who ${t2.style}. Together, ${sign1}'s energy meets ${sign2}'s energy in a way that ${ZODIAC_ELEMENTS[sign1] === ZODIAC_ELEMENTS[sign2] ? 'feels natural and understood' : 'stretches both of you to see the world differently'}.`;
  }
  return { ...base, detail };
}

export function getPersonalityCompat(type1: string, type2: string): CompatDimension {
  let shared = 0;
  for (let i = 0; i < 4; i++) { if (type1[i] === type2[i]) shared++; }
  const insights: Record<number, string> = {
    4: "You're wired almost identically — you just get each other. The comfort is real, but push each other to grow.",
    3: "Three out of four — you're deeply aligned with just enough difference to keep things interesting.",
    2: "You share core traits but diverge on others. This is where the best growth (and best debates) happen.",
    1: "Opposite in many ways, which means you each bring what the other lacks. Friction, but also fascination.",
    0: "Almost total opposites — and that's magnetic. You'll challenge every assumption the other holds.",
  };
  const diffs: string[] = [];
  if (type1[0] !== type2[0]) diffs.push(type1[0] === 'I' ? `${type1} recharges alone; ${type2} recharges with people — respect each other's battery` : `${type1} recharges with people; ${type2} recharges alone — respect each other's battery`);
  if (type1[1] !== type2[1]) diffs.push(type1[1] === 'S' ? `${type1} focuses on details; ${type2} focuses on the big picture — you cover each other's blind spots` : `${type1} focuses on the big picture; ${type2} focuses on details — you cover each other's blind spots`);
  if (type1[2] !== type2[2]) diffs.push(type1[2] === 'T' ? `${type1} leads with logic; ${type2} leads with values — learn to translate between head and heart` : `${type1} leads with values; ${type2} leads with logic — learn to translate between head and heart`);
  if (type1[3] !== type2[3]) diffs.push(type1[3] === 'J' ? `${type1} likes plans; ${type2} likes flexibility — find the sweet spot between structure and spontaneity` : `${type1} likes flexibility; ${type2} likes plans — find the sweet spot between structure and spontaneity`);
  const detail = diffs.length > 0 ? diffs[0] + '.' : `You share all four dimensions — your communication style is nearly identical, which makes understanding each other effortless.`;
  return { score: 50 + shared * 12, insight: insights[shared], detail };
}

export function getAttachmentCompat(style1: string, style2: string): CompatDimension {
  const matrix: Record<string, CompatDimension> = {
    'Secure-Secure': { score: 95, insight: "Two securely attached people — you create a safe, trusting space where both of you can be fully yourselves.", detail: "You both handle conflict calmly and can ask for what you need without drama. This is the gold standard — protect it by staying curious about each other." },
    'Anxious-Secure': { score: 78, insight: "The secure partner provides the steady reassurance the anxious partner craves. A healing combination when met with patience.", detail: "When the anxious partner needs reassurance, a simple 'I'm here, we're good' goes further than you'd think. Don't mistake their need for closeness as clinginess — it's how they love." },
    'Avoidant-Secure': { score: 72, insight: "The secure partner models openness without pressure. Over time, this can gently draw the avoidant partner closer.", detail: "Give the avoidant partner space without taking it personally. They'll come closer on their own timeline — and when they do, it means more because they chose it." },
    'Anxious-Avoidant': { score: 45, insight: "You create a powerful dynamic — one reaches toward connection, the other toward space. When you understand this tension, it becomes your strength.", detail: "The key is naming what's happening: 'I need closeness right now' or 'I need a moment to process.' Agree on a 'pause and return' rule — take 20 minutes, then come back together. This turns friction into understanding." },
    'Anxious-Anxious': { score: 60, insight: "You both crave closeness deeply — which creates warmth but also amplified anxiety. Ground each other.", detail: "When you're both spiralling, one of you needs to be the anchor. Take turns being the steady one — and build a shared ritual that brings you back to centre." },
    'Avoidant-Avoidant': { score: 55, insight: "You respect each other's space instinctively. The challenge is building enough closeness to feel truly connected.", detail: "You're both comfortable with independence, which is great — but schedule regular check-ins where you deliberately go deeper. Connection doesn't happen by accident here." },
    'Fearful-Avoidant-Secure': { score: 68, insight: "The secure partner provides a stable anchor. With patience and consistency, this pairing builds deep, earned trust.", detail: "Consistency is everything here. The secure partner's steadiness gradually rewrites old expectations about what safe connection looks like. Small, reliable gestures matter more than grand ones." },
    'Anxious-Fearful-Avoidant': { score: 42, insight: "You both crave deep connection — you just navigate toward it differently. Naming what you need out loud changes everything.", detail: "This pairing thrives with explicit communication: 'I'm feeling anxious right now' or 'I need a moment to process.' When you stop guessing each other's signals and start sharing them, the dynamic shifts." },
    'Avoidant-Fearful-Avoidant': { score: 48, insight: "You both value independence, which creates mutual respect. The growth edge is building intentional moments of closeness.", detail: "Neither of you naturally moves toward emotional depth — so you get to build it deliberately. Try sharing one honest feeling per day, even a small one. It compounds." },
    'Fearful-Avoidant-Fearful-Avoidant': { score: 40, insight: "You understand each other's inner world because you share the same one. That understanding is rare — and it's the foundation for something real.", detail: "You both know what it's like to want closeness and feel wary of it at the same time. Name the pattern out loud: 'I think we're both pulling away right now.' That awareness alone changes the dynamic." },
  };
  const key1 = [style1, style2].sort().join('-');
  return matrix[key1] || matrix['Secure-Secure'];
}

export function getConnectionCompat(top1: string, top2: string): CompatDimension {
  if (top1 === top2) {
    return { score: 92, insight: "You speak the same love language — when you show love, the other person actually feels it. That's rare and powerful.", detail: `You both feel most loved through ${top1.toLowerCase()}. This means your natural way of showing love is exactly what the other person needs — don't take that for granted.` };
  }
  const tips: Record<string, string> = {
    'Words of Affirmation': 'tell them specifically what you appreciate about them',
    'Acts of Service': 'handle something for them before they ask',
    'Gifts': 'surprise them with something small that shows you were thinking of them',
    'Quality Time': 'put your phone away and give them your full attention',
    'Physical Touch': 'reach out physically — a hug, a hand squeeze, sitting close',
  };
  return { score: 65, insight: `One speaks ${top1.toLowerCase()}, the other ${top2.toLowerCase()}. You'll need to learn each other's dialect — but that's what makes love intentional.`, detail: `To make the other person feel loved: ${tips[top1] || 'show up in their language'}. To feel loved yourself: ask them to ${tips[top2] || 'show up in yours'}.` };
}

// Specific dynamics for key enneagram pairings
const ENNEA_PAIR_DYNAMICS: Record<string, { dynamic: string; strength: string; tension: string }> = {
  '1-2': { dynamic: "The Reformer's drive for correctness meets the Helper's drive for connection. You balance purpose with warmth.", strength: "The One brings structure and integrity; the Two brings empathy and care. Together you create something both principled and compassionate.", tension: "The One can seem critical when they're trying to help, and the Two can feel unappreciated when their efforts aren't acknowledged the 'right' way." },
  '1-7': { dynamic: "Order meets adventure. You fascinate each other precisely because you're so different — One brings discipline, Seven brings joy.", strength: "The Seven helps the One lighten up and enjoy life; the One helps the Seven finish what they start. You each have what the other secretly wants.", tension: "The One can find the Seven irresponsible; the Seven can find the One rigid. Meeting in the middle is the work." },
  '2-4': { dynamic: "Both heart types — you connect on an emotional wavelength that others can't reach. Deep, meaningful, and intensely felt.", strength: "The Two's warmth makes the Four feel truly seen. The Four's depth makes the Two feel like more than just a caretaker. You validate each other's emotional worlds.", tension: "Both can become moody and take things personally. When hurt, the Two over-gives and the Four withdraws — recognise the pattern early." },
  '2-8': { dynamic: "Strength meets softness. The Eight's protectiveness and the Two's care create a powerful bond when trust is established.", strength: "The Eight feels safe to be vulnerable with the Two. The Two feels protected and valued by the Eight. Both are action-oriented lovers who show up for people.", tension: "Both want to be in charge of the relationship's emotional direction. Power struggles emerge when neither is willing to be the one who yields." },
  '3-6': { dynamic: "The Achiever's confidence stabilises the Loyalist's anxiety, while the Loyalist's devotion grounds the Achiever's ambition.", strength: "The Three inspires the Six to take action despite fear. The Six keeps the Three honest and connected to what really matters beyond success.", tension: "The Three can seem superficial to the Six; the Six can seem overly cautious to the Three. Trust builds when both show their real selves." },
  '3-7': { dynamic: "Two high-energy types who accomplish things together. You're the pair that makes plans and actually follows through on them.", strength: "The Three's focus meets the Seven's enthusiasm — you dream big and execute. Both are optimistic, future-oriented, and energising to be around.", tension: "Both avoid negative emotions. When things get hard, neither wants to slow down and process — but that's exactly when you need to." },
  '4-5': { dynamic: "Depth meets depth. The Four's emotional intensity and the Five's intellectual intensity create a rich, private world together.", strength: "The Four draws the Five into their feelings; the Five gives the Four's emotions structure and understanding. You're each other's safe harbour.", tension: "Both need space but for different reasons — the Four to feel, the Five to think. Communicate about when you need closeness versus solitude." },
  '1-5': { dynamic: "Two cerebral types who respect each other's competence. You share a love of getting things right and doing things well.", strength: "The Five's knowledge and the One's principles create a partnership built on mutual respect and intellectual rigour. You trust each other's judgement.", tension: "Both can be emotionally reserved. The relationship may feel correct but cool — deliberately build warmth through shared experiences, not just ideas." },
  '6-9': { dynamic: "The Loyalist's vigilance and the Peacemaker's calm create a surprisingly stable foundation. You balance caution with acceptance.", strength: "The Six feels calmed by the Nine's presence. The Nine feels valued by the Six's loyalty and attention. Together you build genuine safety.", tension: "The Six may want to address problems the Nine would rather avoid. The Nine's passivity can trigger the Six's anxiety. Talk through disagreements before they calcify." },
  '7-9': { dynamic: "Both seek positivity but express it differently — the Seven through activity, the Nine through harmony. Easy, comfortable energy together.", strength: "The Seven energises the Nine to try new things. The Nine helps the Seven slow down and appreciate what's already here. You expand each other's world.", tension: "Both avoid conflict and negative emotions. Issues can go unaddressed for too long because neither wants to rock the boat. Schedule honest check-ins." },
};

export function getEnneagramCompat(type1: number, type2: number): CompatDimension {
  const highCompat = [[2,4],[1,7],[4,5],[2,8],[3,6],[5,1],[6,9],[7,9],[3,7],[1,2]];
  const isHigh = highCompat.some(([a,b]) => (a===type1 && b===type2) || (a===type2 && b===type1));
  const needs: Record<number, string> = {
    1: 'to feel that things are being done right',
    2: 'to feel appreciated for what they give',
    3: 'to feel valued for who they are, not just what they achieve',
    4: 'to feel truly seen and understood',
    5: 'to have space to think and recharge',
    6: 'to feel safe and know they can trust you',
    7: 'to feel free and not boxed in',
    8: 'to feel respected and not controlled',
    9: 'to feel that their voice matters',
  };
  const brings: Record<number, string> = {
    1: 'integrity and a drive to improve', 2: 'warmth and genuine care for others',
    3: 'motivation and the energy to get things done', 4: 'emotional honesty and creative depth',
    5: 'insight and calm, measured thinking', 6: 'loyalty and a sharp eye for what could go wrong',
    7: 'optimism and the ability to find joy anywhere', 8: 'strength and the courage to protect what matters',
    9: 'peace and the ability to make everyone feel heard',
  };

  // Check for specific pair dynamics
  const pairKey = [type1, type2].sort().join('-');
  const pairData = ENNEA_PAIR_DYNAMICS[pairKey];

  if (type1 === type2) {
    return {
      score: 70,
      insight: `Two ${ENNEAGRAM_QS[type1-1].name}s — you understand each other at a core level, but may amplify each other's patterns.`,
      detail: `You both need ${needs[type1]} and you both bring ${brings[type1]}. The beauty is instant understanding — the risk is that you reinforce each other's blind spots. Seek friends and influences outside this dynamic to stay balanced.`,
    };
  }
  if (pairData) {
    return {
      score: 85,
      insight: `${ENNEAGRAM_QS[type1-1].name} and ${ENNEAGRAM_QS[type2-1].name} — ${pairData.dynamic}`,
      detail: `${pairData.strength} Watch for: ${pairData.tension}`,
    };
  }
  return {
    score: 62,
    insight: `${ENNEAGRAM_QS[type1-1].name} meets ${ENNEAGRAM_QS[type2-1].name} — you see the world through different lenses, and that's where the richness lives.`,
    detail: `${ENNEAGRAM_QS[type1-1].name} brings ${brings[type1]} and needs ${needs[type1]}. ${ENNEAGRAM_QS[type2-1].name} brings ${brings[type2]} and needs ${needs[type2]}. Your differences aren't gaps — they're the exact places where you expand each other's perspective.`,
  };
}

export function calculateCompatibility(myResults: QuizResults, theirResults: QuizResults): CompatibilityResult {
  const mySign = myResults.starSign?.sign ?? 'Aries';
  const theirSign = theirResults.starSign?.sign ?? 'Aries';
  const zodiac = getZodiacCompat(mySign, theirSign);
  const personality = getPersonalityCompat(myResults.cognitiveType, theirResults.cognitiveType);
  const attachment = getAttachmentCompat(myResults.attachmentStyle, theirResults.attachmentStyle);
  const connection = getConnectionCompat(myResults.topConnection, theirResults.topConnection);
  const enneagram = getEnneagramCompat(myResults.enneagramType, theirResults.enneagramType);
  const overall = Math.round((zodiac.score + personality.score + attachment.score + connection.score + enneagram.score) / 5);
  return { zodiac, personality, attachment, connection, enneagram, overall };
}

// ===== MOCK CONNECTIONS =====
export const MOCK_CONNECTIONS: Connection[] = [
  {
    name: 'Maya',
    status: 'completed',
    results: {
      cognitiveType: 'ENFJ',
      cognitiveTypeName: 'The Mentor',
      cognitiveTypeDesc: '',
      enneagramType: 2,
      enneagramWing: 3,
      enneagramDisplay: '2w3',
      enneagramName: 'The Giver',
      attachmentStyle: 'Secure',
      attachmentDesc: '',
      anxiety: '2.2',
      avoidance: '1.8',
      topConnection: 'Quality Time',
      connectionScores: { words: 1, acts: 2, gifts: 1, quality: 4, touch: 2 },
      connectionSorted: [['quality', 4], ['acts', 2], ['touch', 2], ['words', 1], ['gifts', 1]],
      connectionNames: { words: 'Words of Affirmation', acts: 'Acts of Service', gifts: 'Gifts', quality: 'Quality Time', touch: 'Physical Touch' },
      connectionDescs: {},
      starSign: { sign: 'Scorpio', symbol: '♏', emoji: '🦂', dates: 'Oct 23 to Nov 21', tagline: 'Intense, passionate, resourceful', desc: '', month: [10,23,11,21] },
    },
  },
  {
    name: 'Jordan',
    status: 'pending',
    invitedDaysAgo: 2,
  },
];
