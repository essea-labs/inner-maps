/**
 * Encode/decode a 5-dimension personality profile into a URL slug.
 *
 * Format: enfp-4w3-secure-qualitytime-aries
 *         type  enn  attach  connection  sign
 */

import { STAR_SIGNS } from './quiz-data';

const STAR_SIGN_NAMES = STAR_SIGNS.map((s) => s.sign.toLowerCase());

const ATTACHMENT_STYLES = [
  'secure',
  'anxious',
  'avoidant',
  'fearfulavoidant',
] as const;

export interface ProfileSlug {
  cognitiveType: string;
  enneagramDisplay: string;
  attachmentStyle: string;
  connectionStyle: string;
  starSign: string;
  starSymbol: string;
}

/** Build a slug from quiz results. */
export function encodeProfileSlug(
  cognitiveType: string,
  enneagramDisplay: string,
  attachmentStyle: string,
  connectionStyle: string,
  starSign: string,
): string {
  return [
    cognitiveType.toLowerCase(),
    enneagramDisplay.toLowerCase(),
    attachmentStyle.toLowerCase().replace(/[\s-]/g, ''),
    connectionStyle.toLowerCase().replace(/[\s]/g, ''),
    starSign.toLowerCase(),
  ].join('-');
}

/** Parse a slug back into profile dimensions. Returns null if invalid. */
export function decodeProfileSlug(slug: string): ProfileSlug | null {
  const parts = slug.toLowerCase().split('-');
  if (parts.length < 5) return null;

  // Part 0: 4-letter cognitive type
  const cognitiveType = parts[0].toUpperCase();
  if (cognitiveType.length !== 4) return null;

  // Part 1: enneagram (contains 'w')
  const enneagramDisplay = parts[1];
  if (!enneagramDisplay.includes('w')) return null;

  // Part 2: attachment style (known set, always one segment)
  const attachmentRaw = parts[2];
  const matchedAttachment = ATTACHMENT_STYLES.find((a) => a === attachmentRaw);
  if (!matchedAttachment) return null;

  const attachmentMap: Record<string, string> = {
    secure: 'Secure',
    anxious: 'Anxious',
    avoidant: 'Avoidant',
    fearfulavoidant: 'Fearful-Avoidant',
  };
  const attachmentStyle = attachmentMap[matchedAttachment] ?? matchedAttachment;

  // Last part: star sign
  const lastPart = parts[parts.length - 1];
  if (!STAR_SIGN_NAMES.includes(lastPart)) return null;
  const starSign = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  const starData = STAR_SIGNS.find((s) => s.sign.toLowerCase() === lastPart);
  const starSymbol = starData?.symbol ?? '';

  // Parts 3 to length-2: connection style (may span multiple segments)
  const connectionParts = parts.slice(3, parts.length - 1);
  const connectionMap: Record<string, string> = {
    wordsofaffirmation: 'Words of Affirmation',
    actsofservice: 'Acts of Service',
    gifts: 'Gifts',
    qualitytime: 'Quality Time',
    physicaltouch: 'Physical Touch',
  };
  const connectionKey = connectionParts.join('');
  const connectionStyle = connectionMap[connectionKey] ?? connectionKey;

  return {
    cognitiveType,
    enneagramDisplay,
    attachmentStyle,
    connectionStyle,
    starSign,
    starSymbol,
  };
}
