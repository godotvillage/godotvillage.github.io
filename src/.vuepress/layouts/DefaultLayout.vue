<template>
  <HopeLayout></HopeLayout>

  <ClientOnly>
    <teleport to="#navbar .vp-navbar-end">
      <div class="nl-nav-item vp-nav-item vp-action">
        <UserLogin />
      </div>
    </teleport>
  </ClientOnly>
</template>

<script>
import { Layout as HopeLayout } from "vuepress-theme-hope/client";
import UserLogin from "../components/UserLogin.vue";
import { ClientOnly } from "vuepress/client";

export default {
  name: "DefaultLayout",
  components: {
    HopeLayout,
    UserLogin,
    ClientOnly,
  },
};
</script>

<style scoped>
.nl-nav-item {
  display: inline-flex;
  align-items: center;
}
</style>


