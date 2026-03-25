import { describe, it, expect } from 'vitest';
import { getStarSign, STAR_SIGNS } from '@/lib/quiz-data';

describe('getStarSign', () => {
  // ─── EACH SIGN: FIRST DAY, LAST DAY, MID-RANGE ───

  const cases: [string, number, number][] = [
    // Capricorn: Dec 22 - Jan 19 (spans year boundary)
    ['Capricorn', 12, 22],
    ['Capricorn', 12, 31],
    ['Capricorn', 1, 1],
    ['Capricorn', 1, 19],
    // Aquarius: Jan 20 - Feb 18
    ['Aquarius', 1, 20],
    ['Aquarius', 2, 18],
    ['Aquarius', 2, 5],
    // Pisces: Feb 19 - Mar 20
    ['Pisces', 2, 19],
    ['Pisces', 3, 20],
    ['Pisces', 3, 1],
    // Aries: Mar 21 - Apr 19
    ['Aries', 3, 21],
    ['Aries', 4, 19],
    // Taurus: Apr 20 - May 20
    ['Taurus', 4, 20],
    ['Taurus', 5, 20],
    // Gemini: May 21 - Jun 20
    ['Gemini', 5, 21],
    ['Gemini', 6, 20],
    // Cancer: Jun 21 - Jul 22
    ['Cancer', 6, 21],
    ['Cancer', 7, 22],
    // Leo: Jul 23 - Aug 22
    ['Leo', 7, 23],
    ['Leo', 8, 22],
    // Virgo: Aug 23 - Sep 22
    ['Virgo', 8, 23],
    ['Virgo', 9, 22],
    // Libra: Sep 23 - Oct 22
    ['Libra', 9, 23],
    ['Libra', 10, 22],
    // Scorpio: Oct 23 - Nov 21
    ['Scorpio', 10, 23],
    ['Scorpio', 11, 21],
    // Sagittarius: Nov 22 - Dec 21
    ['Sagittarius', 11, 22],
    ['Sagittarius', 12, 21],
  ];

  it.each(cases)('%s for month=%d day=%d', (expected, month, day) => {
    expect(getStarSign(month, day).sign).toBe(expected);
  });

  // ─── BOUNDARY TESTS ───

  it('Dec 21 = Sagittarius (not Capricorn)', () => {
    expect(getStarSign(12, 21).sign).toBe('Sagittarius');
  });

  it('Dec 22 = Capricorn', () => {
    expect(getStarSign(12, 22).sign).toBe('Capricorn');
  });

  it('Jan 19 = Capricorn', () => {
    expect(getStarSign(1, 19).sign).toBe('Capricorn');
  });

  it('Jan 20 = Aquarius', () => {
    expect(getStarSign(1, 20).sign).toBe('Aquarius');
  });

  // ─── FALLBACK ───

  it('invalid month/day returns Capricorn (STAR_SIGNS[0])', () => {
    const r = getStarSign(13, 40);
    expect(r.sign).toBe('Capricorn');
  });

  // ─── STAR SIGN DATA ───

  it('all 12 star signs exist in STAR_SIGNS', () => {
    expect(STAR_SIGNS).toHaveLength(12);
    const signs = STAR_SIGNS.map(s => s.sign);
    expect(signs).toContain('Aries');
    expect(signs).toContain('Pisces');
    expect(signs).toContain('Capricorn');
  });

  it('each star sign has emoji and symbol', () => {
    for (const s of STAR_SIGNS) {
      expect(s.emoji).toBeTruthy();
      expect(s.symbol).toBeTruthy();
    }
  });
});
