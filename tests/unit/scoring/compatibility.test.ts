import { describe, it, expect } from 'vitest';
import {
  getZodiacCompat,
  getPersonalityCompat,
  getAttachmentCompat,
  getConnectionCompat,
  getEnneagramCompat,
  calculateCompatibility,
} from '@/lib/compatibility';
import type { QuizResults, StarSign } from '@/lib/types';

// ─── ZODIAC COMPATIBILITY ───

describe('getZodiacCompat', () => {
  it('same sign → score 75', () => {
    expect(getZodiacCompat('Aries', 'Aries').score).toBe(75);
  });

  it('fire-fire → score 82', () => {
    expect(getZodiacCompat('Aries', 'Leo').score).toBe(82);
  });

  it('earth-earth → score 80', () => {
    expect(getZodiacCompat('Taurus', 'Virgo').score).toBe(80);
  });

  it('air-air → score 78', () => {
    expect(getZodiacCompat('Gemini', 'Libra').score).toBe(78);
  });

  it('water-water → score 85', () => {
    expect(getZodiacCompat('Cancer', 'Pisces').score).toBe(85);
  });

  it('fire-air → score 88', () => {
    expect(getZodiacCompat('Aries', 'Gemini').score).toBe(88);
  });

  it('earth-water → score 86', () => {
    expect(getZodiacCompat('Taurus', 'Cancer').score).toBe(86);
  });

  it('fire-earth → score 62', () => {
    expect(getZodiacCompat('Aries', 'Taurus').score).toBe(62);
  });

  it('fire-water → score 58', () => {
    expect(getZodiacCompat('Aries', 'Cancer').score).toBe(58);
  });

  it('earth-air → score 60', () => {
    expect(getZodiacCompat('Taurus', 'Gemini').score).toBe(60);
  });

  it('air-water → score 65', () => {
    expect(getZodiacCompat('Gemini', 'Cancer').score).toBe(65);
  });

  it('is symmetric (A,B same as B,A)', () => {
    expect(getZodiacCompat('Aries', 'Cancer').score).toBe(getZodiacCompat('Cancer', 'Aries').score);
  });

  it('returns detail text', () => {
    const r = getZodiacCompat('Aries', 'Leo');
    expect(r.detail).toBeTruthy();
    expect(r.insight).toBeTruthy();
  });
});

// ─── PERSONALITY COMPATIBILITY ───

describe('getPersonalityCompat', () => {
  it('0 shared letters → score 50', () => {
    expect(getPersonalityCompat('ESTJ', 'INFP').score).toBe(50);
  });

  it('1 shared letter → score 62', () => {
    expect(getPersonalityCompat('ESTJ', 'ENFP').score).toBe(62);
  });

  it('2 shared letters → score 74', () => {
    // ESTJ vs ESFP: E=E, S=S, T≠F, J≠P → 2 shared
    expect(getPersonalityCompat('ESTJ', 'ESFP').score).toBe(74);
  });

  it('3 shared letters → score 86', () => {
    expect(getPersonalityCompat('ESTJ', 'ESTP').score).toBe(86);
  });

  it('4 shared letters (identical) → score 98', () => {
    expect(getPersonalityCompat('ENFP', 'ENFP').score).toBe(98);
  });

  it('formula is 50 + shared * 12', () => {
    for (let shared = 0; shared <= 4; shared++) {
      // Build types with exactly `shared` matching letters
      const type1 = 'ESTJ';
      const letters: [string, string][] = [['E','I'], ['S','N'], ['T','F'], ['J','P']];
      let type2 = '';
      for (let i = 0; i < 4; i++) {
        type2 += i < shared ? letters[i][0] : letters[i][1];
      }
      expect(getPersonalityCompat(type1, type2).score).toBe(50 + shared * 12);
    }
  });

  it('is symmetric', () => {
    expect(getPersonalityCompat('ENFP', 'ISTJ').score).toBe(getPersonalityCompat('ISTJ', 'ENFP').score);
  });
});

// ─── ATTACHMENT COMPATIBILITY ───

describe('getAttachmentCompat', () => {
  it('Secure-Secure → 95', () => {
    expect(getAttachmentCompat('Secure', 'Secure').score).toBe(95);
  });

  it('Anxious-Secure → 78', () => {
    expect(getAttachmentCompat('Anxious', 'Secure').score).toBe(78);
  });

  it('Avoidant-Secure → 72', () => {
    expect(getAttachmentCompat('Avoidant', 'Secure').score).toBe(72);
  });

  it('Anxious-Avoidant → 45', () => {
    expect(getAttachmentCompat('Anxious', 'Avoidant').score).toBe(45);
  });

  it('Anxious-Anxious → 60', () => {
    expect(getAttachmentCompat('Anxious', 'Anxious').score).toBe(60);
  });

  it('Avoidant-Avoidant → 55', () => {
    expect(getAttachmentCompat('Avoidant', 'Avoidant').score).toBe(55);
  });

  it('Fearful-Avoidant-Secure → 68', () => {
    expect(getAttachmentCompat('Fearful-Avoidant', 'Secure').score).toBe(68);
  });

  it('Anxious-Fearful-Avoidant → 42', () => {
    expect(getAttachmentCompat('Anxious', 'Fearful-Avoidant').score).toBe(42);
  });

  it('Avoidant-Fearful-Avoidant → 48', () => {
    expect(getAttachmentCompat('Avoidant', 'Fearful-Avoidant').score).toBe(48);
  });

  it('Fearful-Avoidant-Fearful-Avoidant → 40', () => {
    expect(getAttachmentCompat('Fearful-Avoidant', 'Fearful-Avoidant').score).toBe(40);
  });

  it('is symmetric', () => {
    expect(getAttachmentCompat('Anxious', 'Secure').score).toBe(getAttachmentCompat('Secure', 'Anxious').score);
  });
});

// ─── CONNECTION COMPATIBILITY ───

describe('getConnectionCompat', () => {
  it('same style → 92', () => {
    expect(getConnectionCompat('Quality Time', 'Quality Time').score).toBe(92);
  });

  it('different styles → 65', () => {
    expect(getConnectionCompat('Words of Affirmation', 'Physical Touch').score).toBe(65);
  });

  it('all 5 same-style combos score 92', () => {
    for (const style of ['Words of Affirmation', 'Acts of Service', 'Gifts', 'Quality Time', 'Physical Touch']) {
      expect(getConnectionCompat(style, style).score).toBe(92);
    }
  });

  it('is symmetric', () => {
    expect(getConnectionCompat('Gifts', 'Quality Time').score).toBe(getConnectionCompat('Quality Time', 'Gifts').score);
  });
});

// ─── ENNEAGRAM COMPATIBILITY ───

describe('getEnneagramCompat', () => {
  it('same type → 70', () => {
    expect(getEnneagramCompat(4, 4).score).toBe(70);
  });

  it('high-compat pair (2,4) → 85', () => {
    expect(getEnneagramCompat(2, 4).score).toBe(85);
  });

  it('high-compat pair reversed (4,2) → 85', () => {
    expect(getEnneagramCompat(4, 2).score).toBe(85);
  });

  it('non-high-compat pair → 62', () => {
    // 3 and 4 are not in the highCompat list
    expect(getEnneagramCompat(3, 4).score).toBe(62);
  });

  it('all listed high-compat pairs score 85', () => {
    const pairs: [number, number][] = [[2,4],[1,7],[4,5],[2,8],[3,6],[5,1],[6,9],[7,9],[3,7],[1,2]];
    for (const [a, b] of pairs) {
      expect(getEnneagramCompat(a, b).score).toBe(85);
    }
  });

  it('is symmetric', () => {
    expect(getEnneagramCompat(1, 7).score).toBe(getEnneagramCompat(7, 1).score);
  });
});

// ─── OVERALL COMPATIBILITY ───

describe('calculateCompatibility', () => {
  const makeMockResults = (overrides: Partial<QuizResults> = {}): QuizResults => ({
    cognitiveType: 'ENFP',
    cognitiveTypeName: 'The Campaigner',
    cognitiveTypeDesc: '',
    attachmentStyle: 'Secure',
    attachmentDesc: '',
    anxiety: '2.0',
    avoidance: '2.0',
    connectionScores: { words: 4, acts: 2, gifts: 1, quality: 2, touch: 1 },
    connectionSorted: [['words', 4], ['acts', 2], ['quality', 2], ['gifts', 1], ['touch', 1]],
    connectionNames: {},
    connectionDescs: {},
    topConnection: 'Words of Affirmation',
    enneagramType: 4,
    enneagramWing: 3,
    enneagramName: 'The Individualist',
    enneagramDisplay: '4w3',
    starSign: { sign: 'Pisces', symbol: '♓', emoji: '🐟', dates: '', tagline: '', desc: '', month: [2, 19, 3, 20] },
    ...overrides,
  });

  it('overall is average of 5 dimensions, rounded', () => {
    const r = calculateCompatibility(makeMockResults(), makeMockResults());
    const expectedAvg = Math.round(
      (r.zodiac.score + r.personality.score + r.attachment.score + r.connection.score + r.enneagram.score) / 5
    );
    expect(r.overall).toBe(expectedAvg);
  });

  it('identical profiles produce high compatibility', () => {
    const profile = makeMockResults();
    const r = calculateCompatibility(profile, profile);
    expect(r.overall).toBeGreaterThanOrEqual(70);
  });

  it('returns all 5 dimensions', () => {
    const r = calculateCompatibility(makeMockResults(), makeMockResults());
    expect(r.zodiac).toBeDefined();
    expect(r.personality).toBeDefined();
    expect(r.attachment).toBeDefined();
    expect(r.connection).toBeDefined();
    expect(r.enneagram).toBeDefined();
  });

  it('each dimension has score, insight, detail', () => {
    const r = calculateCompatibility(makeMockResults(), makeMockResults());
    for (const dim of [r.zodiac, r.personality, r.attachment, r.connection, r.enneagram]) {
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(100);
      expect(dim.insight).toBeTruthy();
      expect(dim.detail).toBeTruthy();
    }
  });

  it('is symmetric (A vs B = B vs A)', () => {
    const a = makeMockResults();
    const b = makeMockResults({
      cognitiveType: 'ISTJ',
      attachmentStyle: 'Anxious',
      topConnection: 'Physical Touch',
      enneagramType: 7,
      starSign: { sign: 'Leo', symbol: '♌', emoji: '🦁', dates: '', tagline: '', desc: '', month: [7, 23, 8, 22] },
    });
    const r1 = calculateCompatibility(a, b);
    const r2 = calculateCompatibility(b, a);
    expect(r1.overall).toBe(r2.overall);
  });
});
