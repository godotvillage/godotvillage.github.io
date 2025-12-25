export type AuthUser = {
  id: number;
  loginName: string;
  nickName?: string;
  roles?: unknown[];
};

export const AUTH_STORAGE_KEYS = {
  token: "auth_token",
  tokenType: "auth_tokenType",
  expiresAt: "auth_expiresAt",
  user: "auth_user",
} as const;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function clearAuthSession(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.tokenType);
  localStorage.removeItem(AUTH_STORAGE_KEYS.expiresAt);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
}

export function writeAuthSession(params: {
  token: string;
  tokenType: string;
  expiresAt: number;
  user: AuthUser;
}): void {
  if (!canUseStorage()) return;
  localStorage.setItem(AUTH_STORAGE_KEYS.token, params.token);
  localStorage.setItem(AUTH_STORAGE_KEYS.tokenType, params.tokenType);
  localStorage.setItem(AUTH_STORAGE_KEYS.expiresAt, String(params.expiresAt));
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(params.user));
}

export function readAuthUser(): AuthUser | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function readAuthToken(): { token: string; tokenType: string; expiresAt: number } | null {
  if (!canUseStorage()) return null;
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token) || "";
  const tokenType = localStorage.getItem(AUTH_STORAGE_KEYS.tokenType) || "";
  const expiresAtRaw = localStorage.getItem(AUTH_STORAGE_KEYS.expiresAt) || "";
  const expiresAt = Number(expiresAtRaw);

  if (!token || !tokenType || !Number.isFinite(expiresAt)) return null;
  return { token, tokenType, expiresAt };
}

export function isAuthSessionValid(now: number = Date.now()): boolean {
  const user = readAuthUser();
  const token = readAuthToken();
  if (!user || !token) return false;
  return token.expiresAt > now;
}

export function getAuthorizationHeaderValue(): string | null {
  const token = readAuthToken();
  if (!token) return null;
  if (token.expiresAt <= Date.now()) return null;
  return `${token.tokenType} ${token.token}`;
}


