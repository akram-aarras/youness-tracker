import type { Role } from './types';

export const SESSION_COOKIE_NAME = 'atlasnet_session';

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  name: string;
  role: Role;
  technicianId?: string;
  exp: number;
}

const AUTH_SECRET =
  (typeof process !== 'undefined' && (process.env?.SESSION_SECRET || process.env?.AUTH_SECRET)) ||
  'youness-tracker-secret-hmac-key-2026';

// Portable, deterministic HMAC-SHA256 implementation
function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

function sha256Bytes(bytes: Uint8Array): Uint8Array {
  let i: number, j: number;
  const words: number[] = [];
  const bitLength = bytes.length * 8;
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const padded = new Uint8Array(((bytes.length + 8 + 64) >> 6) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLength, false);
  for (i = 0; i < padded.length; i += 4) {
    words.push(view.getUint32(i, false));
  }
  for (j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = [...hash];
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp1 =
        (hash[7] +
          (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
          ch +
          k[i] +
          ((w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0) | 0)) |
        0;
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0;
      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  const result = new Uint8Array(32);
  const outView = new DataView(result.buffer);
  for (i = 0; i < 8; i++) outView.setUint32(i * 4, hash[i], false);
  return result;
}

export function computeHmacSha256(keyStr: string, dataStr: string): string {
  const encoder = new TextEncoder();
  const rawKey = encoder.encode(keyStr);
  const data = encoder.encode(dataStr);
  const key = rawKey.length > 64 ? sha256Bytes(rawKey) : rawKey;
  const paddedKey = new Uint8Array(64);
  paddedKey.set(key);
  const ipad = new Uint8Array(64);
  const opad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    ipad[i] = paddedKey[i] ^ 0x36;
    opad[i] = paddedKey[i] ^ 0x5c;
  }
  const inner = new Uint8Array(64 + data.length);
  inner.set(ipad);
  inner.set(data, 64);
  const innerHash = sha256Bytes(inner);
  const outer = new Uint8Array(64 + 32);
  outer.set(opad);
  outer.set(innerHash, 64);
  const digest = sha256Bytes(outer);
  return Array.from(digest)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64Url(str: string): string {
  let base64: string;
  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(str, 'utf-8').toString('base64');
  } else {
    base64 = btoa(unescape(encodeURIComponent(str)));
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
  return decodeURIComponent(escape(atob(b64)));
}

// Encode payload and sign with HMAC-SHA256 signature
export function encodeSession(payload: SessionPayload): string {
  const jsonStr = JSON.stringify(payload);
  const payloadB64 = toBase64Url(jsonStr);
  const signature = computeHmacSha256(AUTH_SECRET, payloadB64);
  return `${payloadB64}.${signature}`;
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    const cleanToken = token.trim();
    if (!cleanToken) return null;

    // Reject forged cookies created without signature (e.g. btoa JSON in console)
    const dotIndex = cleanToken.lastIndexOf('.');
    if (dotIndex === -1) {
      return null;
    }

    const payloadB64 = cleanToken.slice(0, dotIndex);
    const signature = cleanToken.slice(dotIndex + 1);

    if (!payloadB64 || !signature) {
      return null;
    }

    // Verify HMAC signature
    const expectedSignature = computeHmacSha256(AUTH_SECRET, payloadB64);
    if (signature !== expectedSignature) {
      return null;
    }

    const jsonStr = fromBase64Url(payloadB64);
    const payload = JSON.parse(jsonStr) as SessionPayload;

    if (!payload.userId || !payload.role || !payload.exp) {
      return null;
    }

    // Check expiration (in milliseconds)
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

