import { describe, it, expect } from 'vitest';
import { encodeProfileSlug, decodeProfileSlug } from '@/lib/profile-slug';

describe('encodeProfileSlug', () => {
  it('encodes a standard profile', () => {
    const slug = encodeProfileSlug('ENFP', '4w3', 'Secure', 'Quality Time', 'Pisces');
    expect(slug).toBe('enfp-4w3-secure-qualitytime-pisces');
  });

  it('encodes Fearful-Avoidant (strips hyphen and space)', () => {
    const slug = encodeProfileSlug('ISTJ', '9w1', 'Fearful-Avoidant', 'Gifts', 'Leo');
    expect(slug).toBe('istj-9w1-fearfulavoidant-gifts-leo');
  });

  it('encodes Words of Affirmation (strips spaces)', () => {
    const slug = encodeProfileSlug('INFJ', '2w1', 'Anxious', 'Words of Affirmation', 'Aries');
    expect(slug).toBe('infj-2w1-anxious-wordsofaffirmation-aries');
  });

  it('encodes Acts of Service', () => {
    const slug = encodeProfileSlug('ENTJ', '8w7', 'Avoidant', 'Acts of Service', 'Scorpio');
    expect(slug).toBe('entj-8w7-avoidant-actsofservice-scorpio');
  });

  it('encodes Physical Touch', () => {
    const slug = encodeProfileSlug('ESFP', '7w6', 'Secure', 'Physical Touch', 'Gemini');
    expect(slug).toBe('esfp-7w6-secure-physicaltouch-gemini');
  });
});

describe('decodeProfileSlug', () => {
  it('decodes a standard slug', () => {
    const result = decodeProfileSlug('enfp-4w3-secure-qualitytime-pisces');
    expect(result).not.toBeNull();
    expect(result!.cognitiveType).toBe('ENFP');
    expect(result!.enneagramDisplay).toBe('4w3');
    expect(result!.attachmentStyle).toBe('Secure');
    expect(result!.connectionStyle).toBe('Quality Time');
    expect(result!.starSign).toBe('Pisces');
    expect(result!.starSymbol).toBe('♓');
  });

  it('decodes Fearful-Avoidant', () => {
    const result = decodeProfileSlug('istj-9w1-fearfulavoidant-gifts-leo');
    expect(result).not.toBeNull();
    expect(result!.attachmentStyle).toBe('Fearful-Avoidant');
  });

  it('decodes Words of Affirmation', () => {
    const result = decodeProfileSlug('infj-2w1-anxious-wordsofaffirmation-aries');
    expect(result).not.toBeNull();
    expect(result!.connectionStyle).toBe('Words of Affirmation');
  });

  it('decodes Acts of Service', () => {
    const result = decodeProfileSlug('entj-8w7-avoidant-actsofservice-scorpio');
    expect(result).not.toBeNull();
    expect(result!.connectionStyle).toBe('Acts of Service');
  });

  it('decodes Physical Touch', () => {
    const result = decodeProfileSlug('esfp-7w6-secure-physicaltouch-gemini');
    expect(result).not.toBeNull();
    expect(result!.connectionStyle).toBe('Physical Touch');
  });

  it('round-trips all attachment styles', () => {
    for (const style of ['Secure', 'Anxious', 'Avoidant', 'Fearful-Avoidant']) {
      const slug = encodeProfileSlug('ENFP', '4w3', style, 'Gifts', 'Aries');
      const decoded = decodeProfileSlug(slug);
      expect(decoded).not.toBeNull();
      expect(decoded!.attachmentStyle).toBe(style);
    }
  });

  it('round-trips all connection styles', () => {
    for (const style of ['Words of Affirmation', 'Acts of Service', 'Gifts', 'Quality Time', 'Physical Touch']) {
      const slug = encodeProfileSlug('ENFP', '4w3', 'Secure', style, 'Aries');
      const decoded = decodeProfileSlug(slug);
      expect(decoded).not.toBeNull();
      expect(decoded!.connectionStyle).toBe(style);
    }
  });

  it('round-trips all 12 star signs', () => {
    const signs = ['Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
      'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'];
    for (const sign of signs) {
      const slug = encodeProfileSlug('ENFP', '4w3', 'Secure', 'Gifts', sign);
      const decoded = decodeProfileSlug(slug);
      expect(decoded).not.toBeNull();
      expect(decoded!.starSign).toBe(sign);
    }
  });

  // ─── INVALID SLUGS ───

  it('returns null for too few parts', () => {
    expect(decodeProfileSlug('enfp-4w3-secure')).toBeNull();
  });

  it('returns null for missing "w" in enneagram', () => {
    expect(decodeProfileSlug('enfp-43-secure-gifts-aries')).toBeNull();
  });

  it('returns null for unknown attachment style', () => {
    expect(decodeProfileSlug('enfp-4w3-unknown-gifts-aries')).toBeNull();
  });

  it('returns null for unknown star sign', () => {
    expect(decodeProfileSlug('enfp-4w3-secure-gifts-neptune')).toBeNull();
  });

  it('returns null for non-4-letter cognitive type', () => {
    expect(decodeProfileSlug('en-4w3-secure-gifts-aries')).toBeNull();
  });
});
