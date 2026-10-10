import { Role } from './types';

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

// Simple, portable base64url encode/decode for Browser, Edge & Node runtimes
export function encodeSession(payload: SessionPayload): string {
  const jsonStr = JSON.stringify(payload);
  let base64: string;

  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
  } else {
    base64 = btoa(unescape(encodeURIComponent(jsonStr)));
  }

  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    let jsonStr: string;
    const cleanToken = token.trim();

    if (cleanToken.startsWith('{') || cleanToken.startsWith('%7B')) {
      jsonStr = decodeURIComponent(cleanToken);
    } else {
      // Convert URL-safe base64 back to standard base64 with padding
      let b64 = cleanToken.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4 !== 0) {
        b64 += '=';
      }

      if (typeof Buffer !== 'undefined') {
        jsonStr = Buffer.from(b64, 'base64').toString('utf-8');
      } else {
        jsonStr = decodeURIComponent(escape(atob(b64)));
      }
    }

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
