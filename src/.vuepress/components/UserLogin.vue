<template>
  <div class="ul-root">
    <button v-if="!isLoggedIn" class="ul-login" type="button" @click="openLogin">
      登录
    </button>

    <div v-else class="ul-user">
      <div class="ul-avatar" :title="displayName">{{ avatarText }}</div>
      <div class="ul-name" :title="displayName">{{ displayName }}</div>
      <button class="ul-logout" type="button" @click="logout" title="登出">🚪</button>
    </div>

    <LoginModal v-model="showModal" @success="onLoginSuccess" @error="onLoginError" />
  </div>
</template>

<script>
import LoginModal from "./LoginModal.vue";
import { userAuth } from "../utils/userAuth";

export default {
  name: "UserLogin",
  components: { LoginModal },
  emits: ["login", "logout", "error"],
  data() {
    return {
      showModal: false,
    };
  },
  computed: {
    isLoggedIn() {
      return userAuth.isLoggedIn();
    },
    displayName() {
      const u = userAuth.getCurrentUser();
      return (u && (u.nickName || u.loginName)) || "";
    },
    avatarText() {
      return this.displayName ? this.displayName.trim().slice(0, 1).toUpperCase() : "?";
    },
  },
  mounted() {
    // ensure initial render reads the latest storage state
    userAuth.isLoggedIn();
  },
  methods: {
    openLogin() {
      this.showModal = true;
    },
    async logout() {
      userAuth.logout();
      this.$emit("logout");
    },
    onLoginSuccess(user) {
      this.$emit("login", user);
    },
    onLoginError(msg) {
      this.$emit("error", msg);
    },
  },
};
</script>

<style scoped>
.ul-root {
  display: flex;
  align-items: center;
}

.ul-login {
  height: 30px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider, #e5e7eb);
  background: var(--vp-c-bg-soft, #f3f4f6);
  color: var(--vp-c-text-1, #111827);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.ul-login:hover {
  background: var(--vp-c-bg-mute, #e5e7eb);
}

.ul-user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 8px 0 6px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider, #e5e7eb);
  background: var(--vp-c-bg, #fff);
}

.ul-avatar {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--vp-c-accent-bg, #2563eb);
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 800;
  line-height: 22px;
}

.ul-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-1, #111827);
}

.ul-logout {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 10px;
  color: var(--vp-c-text-2, #6b7280);
}

.ul-logout:hover {
  background: var(--vp-c-bg-soft, #f3f4f6);
  color: var(--vp-c-text-1, #111827);
}
</style>


