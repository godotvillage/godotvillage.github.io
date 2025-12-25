import { authApi } from "./request";
import { clearAuthSession, isAuthSessionValid, readAuthUser, writeAuthSession } from "./authStorage";
import { ref } from "vue";

// A reactive signal for auth state changes.
// Since auth info is stored in localStorage (non-reactive), we use a version bump to notify Vue computed/watchers.
const authVersion = ref(0);
let storageListenerInstalled = false;

function bumpAuthVersion(): void {
  authVersion.value += 1;
}

function ensureStorageListener(): void {
  if (storageListenerInstalled) return;
  if (typeof window === "undefined") return;

  window.addEventListener("storage", (e: StorageEvent) => {
    if (!e?.key) return;
    if (e.key.startsWith("auth_")) bumpAuthVersion();
  });

  storageListenerInstalled = true;
}

ensureStorageListener();

type LoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    tokenType: string;
    expiresIn: number;
    user: {
      id: number;
      loginName: string;
      nickName?: string;
      roles?: unknown[];
    };
  };
};

class UserAuthService {
  getCurrentUser() {
    void authVersion.value;
    return readAuthUser();
  }

  isLoggedIn() {
    void authVersion.value;
    return isAuthSessionValid();
  }

  getDisplayName() {
    const u = this.getCurrentUser();
    return u?.nickName || u?.loginName || "";
  }

  getAvatarText() {
    const name = this.getDisplayName();
    return name ? name.trim().slice(0, 1).toUpperCase() : "?";
  }

  async login(username: string, password: string) {
    const res = (await authApi.login(username, password)) as LoginResponse;
    if (!res?.success || !res.data) {
      throw new Error(res?.message || "登录失败");
    }

    const { token, tokenType, expiresIn, user } = res.data;
    const expiresAt = Date.now() + Number(expiresIn || 0) * 1000;

    writeAuthSession({
      token,
      tokenType,
      expiresAt,
      user,
    });

    bumpAuthVersion();
    return user;
  }

  logout() {
    clearAuthSession();
    bumpAuthVersion();
  }

  isProjectAuthor(project: any) {
    const u = this.getCurrentUser();
    if (!u || !project) return false;
    return project.githubUser === u.loginName;
  }
}

export const userAuth = new UserAuthService();


