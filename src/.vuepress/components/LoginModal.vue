<template>
  <teleport to="body">
    <div v-if="modelValue" class="lm-overlay" @click="close">
      <div class="lm-card" @click.stop>
        <div class="lm-header">
          <div class="lm-title">登录</div>
          <button class="lm-close" type="button" @click="close" aria-label="关闭">✕</button>
        </div>

        <form class="lm-form" @submit.prevent="submit">
          <div class="lm-field">
            <label class="lm-label" for="lm-username">用户名</label>
            <input
              id="lm-username"
              v-model="username"
              class="lm-input"
              autocomplete="username"
              required
              :disabled="loading"
            />
          </div>

          <div class="lm-field">
            <label class="lm-label" for="lm-password">密码</label>
            <input
              id="lm-password"
              v-model="password"
              class="lm-input"
              type="password"
              autocomplete="current-password"
              required
              :disabled="loading"
            />
          </div>

          <div v-if="errorMessage" class="lm-error">❌ {{ errorMessage }}</div>

          <div class="lm-actions">
            <button class="lm-btn lm-btn-secondary" type="button" @click="close" :disabled="loading">
              取消
            </button>
            <button class="lm-btn lm-btn-primary" type="submit" :disabled="loading">
              {{ loading ? "登录中..." : "登录" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script>
import { userAuth } from "../utils/userAuth";

export default {
  name: "LoginModal",
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ["update:modelValue", "success", "error"],
  data() {
    return {
      username: "",
      password: "",
      loading: false,
      errorMessage: "",
    };
  },
  beforeUnmount() {
    this.setBodyScrollLocked(false);
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) this.errorMessage = "";
        this.setBodyScrollLocked(!!val);
      },
    },
  },
  methods: {
    setBodyScrollLocked(locked) {
      if (typeof document === "undefined") return;
      document.body.classList.toggle("lm-scroll-lock", locked);
    },
    close() {
      this.$emit("update:modelValue", false);
    },
    async submit() {
      this.errorMessage = "";
      this.loading = true;
      try {
        const user = await userAuth.login(this.username.trim(), this.password);
        this.password = "";
        this.$emit("success", user);
        this.close();
      } catch (e) {
        const msg = e?.message || "登录失败";
        this.errorMessage = msg;
        this.$emit("error", msg);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
:global(body.lm-scroll-lock) {
  overflow: hidden;
}

.lm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 16px;
}

.lm-card {
  width: 100%;
  max-width: 420px;
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--vp-c-divider, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.lm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--vp-c-divider, #e5e7eb);
}

.lm-title {
  font-weight: 600;
  color: var(--vp-c-text-1, #111827);
}

.lm-close {
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--vp-c-text-2, #6b7280);
  padding: 6px 8px;
  border-radius: 8px;
}

.lm-close:hover {
  background: var(--vp-c-bg-soft, #f3f4f6);
  color: var(--vp-c-text-1, #111827);
}

.lm-form {
  padding: 16px;
  display: grid;
  gap: 12px;
}

.lm-field {
  display: grid;
  gap: 6px;
}

.lm-label {
  font-size: 13px;
  color: var(--vp-c-text-2, #6b7280);
}

.lm-input {
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--vp-c-divider, #e5e7eb);
  border-radius: 10px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #111827);
  outline: none;
}

.lm-input:focus {
  border-color: var(--vp-c-accent, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.lm-error {
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.08);
  border: 1px solid rgba(185, 28, 28, 0.2);
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 13px;
}

.lm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.lm-btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
}

.lm-btn-secondary {
  border-color: var(--vp-c-divider, #e5e7eb);
  background: var(--vp-c-bg-soft, #f3f4f6);
  color: var(--vp-c-text-1, #111827);
}

.lm-btn-primary {
  background: var(--vp-c-accent-bg, #2563eb);
  color: #fff;
}

.lm-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>


