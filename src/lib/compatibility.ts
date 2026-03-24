import type { CompatDimension, CompatibilityResult, Connection, QuizResults } from './types';
import { ENNEAGRAM_QS } from './quiz-data';

// ===== ZODIAC COMPATIBILITY DATA =====
export const COMPAT_ZODIAC: Record<string, { score: number; insight: string }> = {
  'same': { score: 75, insight: "Same sign energy — you instantly get each other's rhythms, but watch out for mirroring each other's blind spots." },
  'fire-fire': { score: 82, insight: "Double fire. You fuel each other's ambition and passion, but give space before the sparks turn into a wildfire." },
  'earth-earth': { score: 80, insight: "Grounded together. You build something real and lasting, brick by brick. Just don't let routine replace romance." },
  'air-air': { score: 78, insight: "Two minds in constant motion. The conversations never end — but make sure you land somewhere together." },
  'water-water': { score: 85, insight: "Emotionally in sync on a level most people can't reach. You feel each other without words." },
  'fire-air': { score: 88, insight: "Fire and air — you fan each other's flames. Exciting, stimulating, and never boring." },
  'earth-water': { score: 86, insight: "Earth and water — you nurture and ground each other. A naturally supportive, deeply caring dynamic." },
  'fire-earth': { score: 62, insight: "Fire meets earth — one wants to charge ahead, the other wants a plan. Different speeds, but you balance each other." },
  'fire-water': { score: 58, insight: "Steam. Intense chemistry but you process the world in very different ways. Empathy is the bridge." },
  'earth-air': { score: 60, insight: "One lives in the practical, the other in the possible. You'll challenge each other to grow." },
  'air-water': { score: 65, insight: "Head meets heart. You think differently but that's what makes the conversation so rich." },
};

export const ZODIAC_ELEMENTS: Record<string, string> = {
  'Aries': 'fire', 'Leo': 'fire', 'Sagittarius': 'fire',
  'Taurus': 'earth', 'Virgo': 'earth', 'Capricorn': 'earth',
  'Gemini': 'air', 'Libra': 'air', 'Aquarius': 'air',
  'Cancer': 'water', 'Scorpio': 'water', 'Pisces': 'water',
};

// ===== COMPATIBILITY FUNCTIONS =====
export function getZodiacCompat(sign1: string, sign2: string): CompatDimension {
  const base = sign1 === sign2
    ? COMPAT_ZODIAC['same']
    : (COMPAT_ZODIAC[[ZODIAC_ELEMENTS[sign1], ZODIAC_ELEMENTS[sign2]].sort().join('-')] || COMPAT_ZODIAC['fire-earth']);
  const e1 = ZODIAC_ELEMENTS[sign1], e2 = ZODIAC_ELEMENTS[sign2];
  let detail = '';
  if (sign1 === sign2) detail = `Two ${sign1}s means you share the same strengths and the same blind spots. You get each other instantly — the work is in challenging each other to grow.`;
  else if (e1 === e2) detail = `Both ${e1} signs — ${sign1} and ${sign2} share an elemental rhythm. You instinctively understand each other's pace and priorities.`;
  else detail = `${sign1} (${e1}) and ${sign2} (${e2}) — different elements mean different instincts. ${sign1} brings ${e1 === 'fire' ? 'bold energy' : e1 === 'earth' ? 'grounded stability' : e1 === 'air' ? 'fresh perspective' : 'emotional depth'}, ${sign2} brings ${e2 === 'fire' ? 'bold energy' : e2 === 'earth' ? 'grounded stability' : e2 === 'air' ? 'fresh perspective' : 'emotional depth'}.`;
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
    'Anxious-Avoidant': { score: 45, insight: "The classic push-pull dynamic. Intense chemistry, but it takes real work to break the pursue-withdraw cycle.", detail: "The anxious partner pursues; the avoidant partner retreats. Break the cycle by agreeing on a 'pause and return' rule — take 20 minutes, then come back together." },
    'Anxious-Anxious': { score: 60, insight: "You both crave closeness deeply — which creates warmth but also amplified anxiety. Ground each other.", detail: "When you're both spiralling, one of you needs to be the anchor. Take turns being the steady one — and build a shared ritual that brings you back to centre." },
    'Avoidant-Avoidant': { score: 55, insight: "You respect each other's space instinctively. The challenge is building enough closeness to feel truly connected.", detail: "You're both comfortable with independence, which is great — but schedule regular check-ins where you deliberately go deeper. Connection doesn't happen by accident here." },
    'Fearful-Avoidant-Secure': { score: 68, insight: "The secure partner provides a stable anchor. Patience and consistency can slowly build trust.", detail: "The fearful-avoidant partner may push and pull — stay steady. Your consistency is literally rewiring their expectations of what safe love looks like." },
    'Anxious-Fearful-Avoidant': { score: 42, insight: "Both crave connection but struggle with trust. Compassion and clear communication are essential.", detail: "This pairing needs explicit communication about what's happening internally. 'I'm feeling anxious right now' or 'I need a moment' prevents misreading each other's signals." },
    'Avoidant-Fearful-Avoidant': { score: 48, insight: "Both default to distance when things get intense. Creating intentional moments of vulnerability is key.", detail: "Neither of you naturally moves toward emotional depth — so you need to build it deliberately. Try sharing one honest feeling per day, even a small one." },
    'Fearful-Avoidant-Fearful-Avoidant': { score: 40, insight: "You understand each other's walls because you have the same ones. Breaking through together takes courage, but it's transformative.", detail: "You both know what it's like to want closeness and fear it simultaneously. Name the pattern out loud: 'I think we're both pulling away right now.' Awareness breaks the spell." },
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
  const detail = type1 === type2
    ? `You both need ${needs[type1]}. Since you share this drive, make sure you're meeting it for each other — not just assuming it's handled.`
    : `${ENNEAGRAM_QS[type1-1].name} needs ${needs[type1]}. ${ENNEAGRAM_QS[type2-1].name} needs ${needs[type2]}. Know these, and you'll never accidentally hurt each other.`;
  if (type1 === type2) {
    return { score: 70, insight: `Two ${ENNEAGRAM_QS[type1-1].name}s — you understand each other at a core level, but may amplify each other's patterns. Awareness is everything.`, detail };
  }
  if (isHigh) {
    return { score: 85, insight: `${ENNEAGRAM_QS[type1-1].name} and ${ENNEAGRAM_QS[type2-1].name} — a naturally complementary pairing. You bring out the best in each other's growth journey.`, detail };
  }
  return { score: 62, insight: `${ENNEAGRAM_QS[type1-1].name} meets ${ENNEAGRAM_QS[type2-1].name} — different core motivations mean you'll see the world through very different lenses. That's where the learning lives.`, detail };
}

export function calculateCompatibility(myResults: QuizResults, theirResults: QuizResults): CompatibilityResult {
  const zodiac = getZodiacCompat(myResults.starSign!.sign, theirResults.starSign!.sign);
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
