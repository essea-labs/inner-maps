import type {
  Section,
  CognitiveQuestion,
  AttachmentQuestion,
  ConnectionQuestion,
  EnneagramQuestion,
  StarSign,
  QuizAnswers,
  QuizResults,
} from './types';

// ===== SECTIONS =====
export const SECTIONS: Section[] = [
  { id: 'starsign', name: 'Star Sign', icon: '✦', questions: 0 },
  { id: 'cognitive', name: 'Personality Type', icon: '🧠', questions: 12 },
  { id: 'attachment', name: 'Attachment Style', icon: '💛', questions: 8 },
  { id: 'connection', name: 'Connection Style', icon: '🤝', questions: 10 },
  { id: 'enneagram', name: 'Enneagram', icon: '🔮', questions: 10 },
];

// ===== COGNITIVE QUESTIONS (12 A/B) =====
export const COGNITIVE_QS: CognitiveQuestion[] = [
  { q: "You've got a free Saturday. What sounds better?", a: "Rally the group chat, let's do something!", b: "Keep it open. Solo time sounds perfect." },
  { q: "After a brutal week, you recharge by...", a: "Going out. People give you energy, even when you're drained.", b: "Staying in. You need quiet before you can be 'on' again." },
  { q: "In a group conversation, you usually...", a: "Jump right in. You think best out loud.", b: "Listen first, then speak once your thoughts are formed." },
  { q: "When you're telling a story, you tend to...", a: "Include the details — who was there, what was said, exactly how it happened.", b: "Jump to the point — the meaning or punchline, not all the specifics." },
  { q: "You just finished a really good book or show. You think about...", a: "The scenes that stuck with you — specific moments, lines, images.", b: "What it was really about underneath — the themes, the message." },
  { q: "When you meet someone new, you first pick up on...", a: "The facts — what they do, where they're from, how you're connected.", b: "The vibe — their energy, whether you click, what's beneath the surface." },
  { q: "A friend asks for your honest opinion on a tough situation. You lean toward...", a: "Giving the most accurate assessment, even if it's not what they want to hear.", b: "Framing your thoughts carefully — honesty matters, but so does how they feel." },
  { q: "When you're processing a big life decision, you mostly...", a: "Make a mental list of outcomes and pick the smartest one.", b: "Sit with how each option feels until one clicks." },
  { q: "When you need to make a group decision, you focus on...", a: "What makes the most logical sense for everyone — fairness through reason.", b: "How everyone feels about the options — fairness through making sure nobody's upset." },
  { q: "Your approach to a weekend trip:", a: "Itinerary first. I like knowing what's happening.", b: "Wing it. The best stuff is unplanned anyway." },
  { q: "When you've got a deadline:", a: "Steady progress. I aim to finish early.", b: "Last-minute magic. Pressure is my fuel." },
  { q: "When making plans with people, you prefer...", a: "To lock it in early — you like having something confirmed.", b: "To keep it loose — closer to the time, see what feels right." },
];

// ===== ATTACHMENT QUESTIONS (8 Likert) =====
export const ATTACHMENT_QS: AttachmentQuestion[] = [
  { q: "When someone I care about doesn't reply for a while, I start wondering if something's wrong between us.", dim: 'anxiety' },
  { q: "I sometimes need reassurance from people close to me that they still value our relationship.", dim: 'anxiety' },
  { q: "I worry more than most people about being left out or abandoned.", dim: 'anxiety' },
  { q: "When there's conflict with someone close, I can't stop thinking about it until it's resolved.", dim: 'anxiety' },
  { q: "I feel uncomfortable when people want to get very emotionally close to me.", dim: 'avoidance' },
  { q: "I prefer handling my problems solo rather than leaning on others.", dim: 'avoidance' },
  { q: "When a relationship gets serious, I sometimes feel an urge to pull back.", dim: 'avoidance' },
  { q: "I find it hard to fully trust and depend on other people.", dim: 'avoidance' },
];

// ===== CONNECTION QUESTIONS (10 forced-choice pairs) =====
export const CONNECTION_QS: ConnectionQuestion[] = [
  { q: "After a rough day, which would mean more?", a: "A text saying \"I'm so proud of how you handle things\"", b: "Coming home to dinner already made", aType: 'words', bType: 'acts' },
  { q: "Which would mean more to you?", a: "A voice note telling you exactly why they appreciate you", b: "A small gift they picked up because it reminded them of you", aType: 'words', bType: 'gifts' },
  { q: "Which fills your cup more?", a: "A message out of the blue telling you exactly what they love about you", b: "An unplanned evening together — no phones, no plans, just being together", aType: 'words', bType: 'quality' },
  { q: "Which makes you feel most loved?", a: "Hearing \"you're my favourite person\" out of nowhere", b: "A long hug when they can tell you need it", aType: 'words', bType: 'touch' },
  { q: "Which would you appreciate more?", a: "Someone quietly handling something you've been dreading", b: "A thoughtful birthday present that shows they really know you", aType: 'acts', bType: 'gifts' },
  { q: "Which says 'I love you' louder?", a: "They take over your errands so you can rest", b: "A slow morning together — nowhere to be, just enjoying each other's company", aType: 'acts', bType: 'quality' },
  { q: "After a hard week, which would you rather come home to?", a: "Everything taken care of — dishes done, space tidied", b: "A big, tight hug the moment you walk in", aType: 'acts', bType: 'touch' },
  { q: "Which would mean more from someone you love?", a: "A gift that shows they remembered something small you once mentioned", b: "A whole afternoon together, phones away, fully present", aType: 'gifts', bType: 'quality' },
  { q: "Which makes you feel more connected?", a: "Receiving something personal they chose just for you", b: "Sitting close together, their arm around you", aType: 'gifts', bType: 'touch' },
  { q: "Which moment would you replay in your head?", a: "A deep conversation where you both lost track of time", b: "A long hug where neither of you lets go first", aType: 'quality', bType: 'touch' },
];

// ===== ENNEAGRAM QUESTIONS (9 statements + dynamic Q10 tiebreaker) =====
export const ENNEAGRAM_QS: EnneagramQuestion[] = [
  { q: "There's a voice in my head that always knows how things should be done. I hold myself to high standards — sometimes impossibly high — and I can't easily let things slide when they're not right.", type: 1, name: 'The Perfectionist', desc: "You're driven by a deep desire to be good and to do things right. Your inner critic is loud, but it's also what makes you incredibly principled and reliable. You hold the world to a high standard, starting with yourself." },
  { q: "I naturally tune into what the people around me need, often before they ask. I pour a lot into my relationships, and if I'm honest, I sometimes wish people noticed how much I give without being asked.", type: 2, name: 'The Giver', desc: "You're wired to nurture and support the people around you. You show love through action and generosity, sometimes before anyone even asks. Your challenge is remembering that your own needs matter just as much." },
  { q: "I care more than I'd like to admit about how I come across. I'm driven to succeed and I naturally adapt to what each situation calls for — but sometimes I catch myself wondering who I actually am when I'm not performing.", type: 3, name: 'The Achiever', desc: "You're a natural performer who thrives on goals, recognition, and forward momentum. You adapt effortlessly to what's needed, but your deepest growth comes from knowing you're enough, even without the wins." },
  { q: "I feel things more intensely than most. I want to be truly understood, not just liked — surface connections leave me cold.", type: 4, name: 'The Individualist', desc: "You experience life at a depth most people never reach. You're drawn to meaning, beauty, and authentic self-expression. What makes you different isn't a flaw. It's your greatest gift." },
  { q: "I need to understand things deeply before I feel comfortable acting on them. I'm selective with my energy and my time — I'd rather know a lot about a few things than a little about everything.", type: 5, name: 'The Investigator', desc: "You move through the world by observing, analyzing, and understanding. You guard your energy carefully because your inner world is rich and vast. When you share your knowledge, people are always struck by how much you see." },
  { q: "My mind is always running through what-ifs — not to be negative, but because I feel better when I've thought things through. Trust matters a lot to me, and once someone earns it, I'm one of the most loyal people you'll meet.", type: 6, name: 'The Loyalist', desc: "You're the person everyone counts on when things get tough. Your ability to anticipate problems makes you incredibly valuable, and your loyalty runs deep. Learning to trust yourself as much as others trust you is your superpower." },
  { q: "I keep things moving and stay upbeat. I'd rather find the next interesting thing than sit with something heavy — I get restless when options close off.", type: 7, name: 'The Enthusiast', desc: "You bring infectious energy and optimism everywhere you go. You see possibility where others see limitation, and your zest for life is genuinely contagious. Your growth edge is sitting with discomfort instead of outrunning it." },
  { q: "I'd rather be honest and direct than polite and fake. I have strong instincts about power and fairness, and when someone I care about is being treated badly, I don't hesitate to step in. Letting my guard down doesn't come naturally.", type: 8, name: 'The Challenger', desc: "You lead with strength, directness, and a fierce protective instinct. People feel safe around you because you say what you mean and mean what you say. Beneath that tough exterior is someone who cares more deeply than most." },
  { q: "I'm the person who can genuinely see every side of an argument. I tend to go with the flow more than push my own agenda — and if I'm being honest, sometimes I realize I've been so focused on keeping things smooth that I've lost track of what I actually want.", type: 9, name: 'The Peacemaker', desc: "You have a rare gift for seeing all sides and creating harmony. Your steady, calming presence makes people feel at ease. Your growth journey is about realising your own voice and desires matter just as much as everyone else's." },
];

// ===== STAR SIGNS =====
export const STAR_SIGNS: StarSign[] = [
  { sign: 'Capricorn', symbol: '♑', emoji: '🐐', dates: 'Dec 22 to Jan 19', tagline: 'Ambitious, disciplined, patient', desc: "You climb mountains others don't even see. Quietly ambitious with unshakable discipline, you play the long game and you almost always win it.", month: [12,22,1,19] },
  { sign: 'Aquarius', symbol: '♒', emoji: '🏺', dates: 'Jan 20 to Feb 18', tagline: 'Independent, original, humanitarian', desc: "You think three steps ahead of everyone else. Fiercely independent with a mind that refuses to follow the crowd, you see possibilities where others see walls.", month: [1,20,2,18] },
  { sign: 'Pisces', symbol: '♓', emoji: '🐟', dates: 'Feb 19 to Mar 20', tagline: 'Intuitive, compassionate, artistic', desc: "You feel everything, and that's your superpower. Deeply intuitive and endlessly creative, you navigate life through emotion and imagination in equal measure.", month: [2,19,3,20] },
  { sign: 'Aries', symbol: '♈', emoji: '🐏', dates: 'Mar 21 to Apr 19', tagline: 'Bold, ambitious, energetic', desc: "You don't wait for permission. You just go. Natural-born initiators with contagious energy, you light fires wherever you walk and inspire others to keep up.", month: [3,21,4,19] },
  { sign: 'Taurus', symbol: '♉', emoji: '🐂', dates: 'Apr 20 to May 20', tagline: 'Grounded, sensual, reliable', desc: "You know what you want and you're in no rush to settle. Steady, sensual, and deeply loyal, you build things that last. Relationships included.", month: [4,20,5,20] },
  { sign: 'Gemini', symbol: '♊', emoji: '👯', dates: 'May 21 to Jun 20', tagline: 'Curious, witty, adaptable', desc: "Your mind moves at a speed most people can't keep up with. Endlessly curious, socially magnetic, and quick-witted, you make every conversation more interesting.", month: [5,21,6,20] },
  { sign: 'Cancer', symbol: '♋', emoji: '🦀', dates: 'Jun 21 to Jul 22', tagline: 'Nurturing, intuitive, protective', desc: "You carry the emotional weight of your world, and you wouldn't have it any other way. Deeply nurturing with razor-sharp intuition, you create safety wherever you go.", month: [6,21,7,22] },
  { sign: 'Leo', symbol: '♌', emoji: '🦁', dates: 'Jul 23 to Aug 22', tagline: 'Confident, creative, warm-hearted', desc: "You walk into a room and the energy shifts. Magnetic, generous, and unapologetically yourself, you lead with your heart and lift everyone around you.", month: [7,23,8,22] },
  { sign: 'Virgo', symbol: '♍', emoji: '🌾', dates: 'Aug 23 to Sep 22', tagline: 'Analytical, thoughtful, meticulous', desc: "You notice what everyone else misses. Brilliantly analytical with a quiet perfectionism, you make the world better through your attention to detail and genuine care.", month: [8,23,9,22] },
  { sign: 'Libra', symbol: '♎', emoji: '⚖️', dates: 'Sep 23 to Oct 22', tagline: 'Harmonious, fair, social', desc: "You see beauty in balance and bring grace to everything you touch. A natural diplomat with impeccable taste, you make people feel seen, heard, and at ease.", month: [9,23,10,22] },
  { sign: 'Scorpio', symbol: '♏', emoji: '🦂', dates: 'Oct 23 to Nov 21', tagline: 'Intense, passionate, resourceful', desc: "You don't do anything halfway. Intensely perceptive with a magnetic presence, you see through people effortlessly, and once you commit, you're all in.", month: [10,23,11,21] },
  { sign: 'Sagittarius', symbol: '♐', emoji: '🏹', dates: 'Nov 22 to Dec 21', tagline: 'Adventurous, optimistic, free-spirited', desc: "You were born chasing horizons. Endlessly optimistic with an insatiable appetite for adventure and truth, you make life feel like one big, beautiful experiment.", month: [11,22,12,21] },
];

// ===== TYPE NAMES & DESCRIPTIONS =====
export const TYPE_NAMES: Record<string, string> = {
  'INTJ': 'The Strategist', 'INTP': 'The Thinker', 'ENTJ': 'The Commander', 'ENTP': 'The Debater',
  'INFJ': 'The Advocate', 'INFP': 'The Dreamer', 'ENFJ': 'The Mentor', 'ENFP': 'The Campaigner',
  'ISTJ': 'The Inspector', 'ISFJ': 'The Protector', 'ESTJ': 'The Director', 'ESFJ': 'The Caregiver',
  'ISTP': 'The Craftsperson', 'ISFP': 'The Artist', 'ESTP': 'The Entrepreneur', 'ESFP': 'The Performer',
};

export const TYPE_DESCRIPTIONS: Record<string, string> = {
  'INTJ': "Strategic and independent, you see the world as a chess board. You're driven by a vision of how things could be better, and you've probably already mapped out how to get there.",
  'INTP': "Endlessly curious with a mind that never stops analyzing. You love pulling ideas apart to see how they work, and you're happiest when you're solving a puzzle nobody else has cracked.",
  'ENTJ': "A natural leader who turns vision into action. You see inefficiency and immediately start optimizing, and you're not afraid to take charge to make it happen.",
  'ENTP': "Quick-witted and endlessly inventive. You love playing devil's advocate, not to be difficult, but because exploring every angle is how you find the best ideas.",
  'INFJ': "Quietly intense with a deep understanding of people. You see patterns in human behavior that others miss, and you're driven by a desire to help others reach their potential.",
  'INFP': "A deep well of empathy and creativity. You navigate life by an internal compass of values, and you're always searching for meaning beneath the surface.",
  'ENFJ': "Warm, charismatic, and deeply attuned to others. You have a gift for seeing the best in people and inspiring them to see it too.",
  'ENFP': "Enthusiastic, creative, and full of infectious energy. You see life as a web of fascinating connections and possibilities, and you want to explore every single one.",
  'ISTJ': "Reliable, thorough, and quietly determined. When you commit to something, you follow through. No drama, no shortcuts, just steady, excellent execution.",
  'ISFJ': "Quietly devoted and attentive to the needs of others. You remember the little things, what people like, what they need, and you show love through consistent, thoughtful action.",
  'ESTJ': "Organised, decisive, and naturally in charge. You bring structure to chaos and hold yourself (and everyone around you) to high standards.",
  'ESFJ': "The social glue that holds groups together. You create warmth wherever you go and have an almost sixth sense for what others are feeling.",
  'ISTP': "Cool, adaptable, and endlessly practical. You learn by doing, fix things by instinct, and stay calm when everyone else is panicking.",
  'ISFP': "Gentle, creative, and quietly passionate. You experience the world through your senses and express yourself through what you create rather than what you say.",
  'ESTP': "Bold, pragmatic, and always in the moment. You'd rather jump in and figure it out than sit around planning. And honestly, it usually works out.",
  'ESFP': "Vibrant, spontaneous, and impossible to ignore. You bring energy to every room and you believe life is too short not to enjoy every moment of it.",
};

// ===== UTILITY FUNCTIONS =====
export function getStarSign(month: number, day: number): StarSign {
  for (const s of STAR_SIGNS) {
    const [m1, d1, m2, d2] = s.month;
    if ((month === m1 && day >= d1) || (month === m2 && day <= d2)) return s;
  }
  return STAR_SIGNS[0];
}

/**
 * Rehydrate derived fields (names, descriptions, symbols) on a QuizResults object
 * that was restored from the DB (which only stores raw scores/types, not the text).
 */
export function rehydrateResults(r: QuizResults, starSign: StarSign | null): QuizResults {
  const connectionNames: Record<string, string> = {
    words: 'Words of Affirmation',
    acts: 'Acts of Service',
    gifts: 'Gifts',
    quality: 'Quality Time',
    touch: 'Physical Touch',
  };
  const connectionDescs: Record<string, string> = {
    words: "You feel most loved when people express their feelings in words. Compliments, encouragement, a heartfelt \"I love you\", or a thoughtful message. Hearing what someone appreciates about you fills your cup like nothing else.",
    acts: "Actions speak louder than words for you. When someone goes out of their way to make your life easier, cooking, helping, taking something off your plate, that's when you feel truly cared for.",
    gifts: "It's not about the price tag. It's the thought behind it. A meaningful gift tells you someone was thinking about you when you weren't around, and that's what makes you feel loved.",
    quality: "You feel most connected when someone gives you their full, undivided attention. Phones down, eyes on you, fully present. That's your version of being truly seen.",
    touch: "Physical closeness is how you feel safe and connected. A hug, a hand on your shoulder, sitting close together. These small moments of contact speak volumes to you.",
  };
  const attachmentDescriptions: Record<string, string> = {
    'Secure': "You're comfortable with closeness and confident in your relationships. You trust easily and communicate openly.",
    'Anxious': "You crave deep connection but sometimes worry it's not reciprocated. You're sensitive to shifts in closeness.",
    'Avoidant': "You value your independence highly and can feel overwhelmed by too much emotional closeness.",
    'Fearful-Avoidant': "You want deep connection but find it hard to trust fully. You may push and pull in relationships.",
  };

  return {
    ...r,
    cognitiveTypeName: TYPE_NAMES[r.cognitiveType] || r.cognitiveTypeName || 'Unknown',
    cognitiveTypeDesc: TYPE_DESCRIPTIONS[r.cognitiveType] || r.cognitiveTypeDesc || '',
    attachmentDesc: attachmentDescriptions[r.attachmentStyle] || r.attachmentDesc || '',
    connectionNames: Object.keys(r.connectionNames ?? {}).length > 0 ? r.connectionNames : connectionNames,
    connectionDescs: Object.keys(r.connectionDescs ?? {}).length > 0 ? r.connectionDescs : connectionDescs,
    enneagramName: ENNEAGRAM_QS[r.enneagramType - 1]?.name || r.enneagramName || '',
    starSign: starSign ?? r.starSign,
  };
}

export function calculateResults(answers: QuizAnswers, starSign: StarSign | null): QuizResults {
  // Cognitive Type — with continuous dimension scores
  const dims = [
    { letters: ['E', 'I'] as const, range: [0, 3] },
    { letters: ['S', 'N'] as const, range: [3, 6] },
    { letters: ['T', 'F'] as const, range: [6, 9] },
    { letters: ['J', 'P'] as const, range: [9, 12] },
  ];
  let type = '';
  const dimensionScores: Record<string, number> = {};
  dims.forEach(d => {
    let aCount = 0;
    const total = d.range[1] - d.range[0];
    for (let i = d.range[0]; i < d.range[1]; i++) {
      if (answers.cognitive[i] === 'a') aCount++;
    }
    dimensionScores[`${d.letters[0]}/${d.letters[1]}`] = aCount / total;
    type += aCount >= Math.ceil(total / 2) ? d.letters[0] : d.letters[1];
  });

  // Attachment
  const anxietyScores = answers.attachment.slice(0, 4).map(Number);
  const avoidanceScores = answers.attachment.slice(4, 8).map(Number);
  const anxiety = anxietyScores.reduce((a, b) => a + b, 0) / 4;
  const avoidance = avoidanceScores.reduce((a, b) => a + b, 0) / 4;
  let attachmentStyle = '';
  if (anxiety <= 3 && avoidance <= 3) attachmentStyle = 'Secure';
  else if (anxiety > 3 && avoidance <= 3) attachmentStyle = 'Anxious';
  else if (anxiety <= 3 && avoidance > 3) attachmentStyle = 'Avoidant';
  else attachmentStyle = 'Fearful-Avoidant';

  const attachmentDescriptions: Record<string, string> = {
    'Secure': "You're comfortable with closeness and confident in your relationships. You trust easily and communicate openly.",
    'Anxious': "You crave deep connection but sometimes worry it's not reciprocated. You're sensitive to shifts in closeness.",
    'Avoidant': "You value your independence highly and can feel overwhelmed by too much emotional closeness.",
    'Fearful-Avoidant': "You want deep connection but find it hard to trust fully. You may push and pull in relationships.",
  };

  // Connection Style
  const connectionScores: Record<string, number> = { words: 0, acts: 0, gifts: 0, quality: 0, touch: 0 };
  CONNECTION_QS.forEach((q, i) => {
    const answer = answers.connection[i];
    if (answer === 'a') connectionScores[q.aType]++;
    else if (answer === 'b') connectionScores[q.bType]++;
  });
  const connectionNames: Record<string, string> = {
    words: 'Words of Affirmation',
    acts: 'Acts of Service',
    gifts: 'Gifts',
    quality: 'Quality Time',
    touch: 'Physical Touch',
  };
  const connectionDescs: Record<string, string> = {
    words: "You feel most loved when people express their feelings in words. Compliments, encouragement, a heartfelt \"I love you\", or a thoughtful message. Hearing what someone appreciates about you fills your cup like nothing else.",
    acts: "Actions speak louder than words for you. When someone goes out of their way to make your life easier, cooking, helping, taking something off your plate, that's when you feel truly cared for.",
    gifts: "It's not about the price tag. It's the thought behind it. A meaningful gift tells you someone was thinking about you when you weren't around, and that's what makes you feel loved.",
    quality: "You feel most connected when someone gives you their full, undivided attention. Phones down, eyes on you, fully present. That's your version of being truly seen.",
    touch: "Physical closeness is how you feel safe and connected. A hug, a hand on your shoulder, sitting close together. These small moments of contact speak volumes to you.",
  };
  const sortedConnection = Object.entries(connectionScores).sort((a, b) => b[1] - a[1]);

  // Enneagram — Q1-9 Likert + Q10 tiebreaker (with ipsative normalization)
  const rawEnnScores = Array(10).fill(0); // index 1-9 used
  answers.enneagram.slice(0, 9).forEach((v, i) => { rawEnnScores[i + 1] = Number(v) || 0; });

  // Ipsative normalization: subtract user's mean so only relative preferences matter
  // This eliminates response style bias (e.g., rating everything high vs moderate)
  const ennMean = rawEnnScores.slice(1).reduce((a, b) => a + b, 0) / 9;
  const ennScores = Array(10).fill(0);
  for (let t = 1; t <= 9; t++) { ennScores[t] = rawEnnScores[t] - ennMean; }

  // Q10: 3-way tiebreaker — compare top 3 types, winner gets +2
  const tbTop3 = [1,2,3,4,5,6,7,8,9].sort((a, b) => ennScores[b] - ennScores[a]).slice(0, 3);
  const tbAnswer = answers.enneagram[9];
  if (tbAnswer === 'a') ennScores[tbTop3[0]] += 2;
  else if (tbAnswer === 'b') ennScores[tbTop3[1]] += 2;
  else if (tbAnswer === 'c') ennScores[tbTop3[2]] += 2;

  let maxScore = -Infinity, coreType = 1;
  for (let t = 1; t <= 9; t++) { if (ennScores[t] > maxScore) { maxScore = ennScores[t]; coreType = t; } }

  // Wing: compare adjacent types, with threshold — if both are below mean, no wing
  const adjLeft = coreType === 1 ? 9 : coreType - 1;
  const adjRight = coreType === 9 ? 1 : coreType + 1;
  const leftScore = ennScores[adjLeft];
  const rightScore = ennScores[adjRight];
  const hasWing = leftScore > 0 || rightScore > 0; // at least one adjacent above mean
  const wing = hasWing
    ? (leftScore >= rightScore ? adjLeft : adjRight)
    : coreType; // fallback: no wing (display as just the type)
  const enneagramName = ENNEAGRAM_QS[coreType - 1].name;

  return {
    cognitiveType: type,
    cognitiveTypeName: TYPE_NAMES[type] || 'Unknown',
    cognitiveTypeDesc: TYPE_DESCRIPTIONS[type] || '',
    attachmentStyle,
    attachmentDesc: attachmentDescriptions[attachmentStyle],
    anxiety: anxiety.toFixed(1),
    avoidance: avoidance.toFixed(1),
    connectionScores,
    connectionSorted: sortedConnection,
    connectionNames,
    connectionDescs,
    topConnection: connectionNames[sortedConnection[0][0]],
    enneagramType: coreType,
    enneagramWing: wing,
    enneagramName,
    enneagramDisplay: hasWing && wing !== coreType ? `${coreType}w${wing}` : `Type ${coreType}`,
    dimensionScores,
    starSign,
  };
}
