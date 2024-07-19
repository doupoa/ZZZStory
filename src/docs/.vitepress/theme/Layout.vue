<!-- .vitepress/theme/Layout.vue -->

<script setup lang="ts">
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { nextTick, provide } from "vue";
import error_404 from "/error-404.png";
import error_404_dark from "/error-404-dark.png";

const { Layout } = DefaultTheme;

const { isDark } = useData();

const enableTransitions = () =>
  "startViewTransition" in document &&
  window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

provide("toggle-appearance", async ({ clientX: x, clientY: y }: MouseEvent) => {
  if (!enableTransitions()) {
    isDark.value = !isDark.value;
    return;
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`,
  ];

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value;
    await nextTick();
  }).ready;

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 500,
      easing: "ease-in-out",
      pseudoElement: `::view-transition-${isDark.value ? "old" : "new"}(root)`,
    }
  );
});
</script>

<template>
  <Layout>
    <template #not-found>
      <!-- 修改自 vitepress/src/client/theme-default/NotFound.vue -->
      <div class="NotFound">
        <img :src="error_404" alt="404" class="error_img" v-if="!isDark" />
        <img :src="error_404_dark" alt="404" class="error_img" v-else />
        <p class="error_code">嗯呢嗯呢呢!（资料不见啦！）</p>
        <h1 class="error_title">PAGE NOT FOUND</h1>
        <div class="error_divider"></div>
        <div class="error_action">
          <a class="error_link" href="/started" aria-label="go to started">
            回到索引
          </a>
        </div>
      </div>
    </template>
  </Layout>
</template>

<style>
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 9999;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}

.NotFound {
  padding: 64px 24px 96px;
  text-align: center;
}

@media (min-width: 768px) {
  .NotFound {
    padding: 96px 32px 168px;
  }
}

.error_code {
  line-height: 64px;
  font-size: 32px;
  font-weight: 600;
}

.error_title {
  padding-top: 12px;
  letter-spacing: 2px;
  line-height: 20px;
  font-size: 20px;
  font-weight: 700;
}

.error_divider {
  margin: 24px auto 18px;
  width: 64px;
  height: 1px;
  background-color: var(--vp-c-divider);
}

.error_action {
  padding-top: 20px;
}

.error_link {
  display: inline-block;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 16px;
  padding: 3px 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
  transition: border-color 0.25s, color 0.25s;
}

.error_link:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-2);
}

.error_img {
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  line-height: 1;
  visibility: visible;
  text-align: center;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  width: 16rem;
  margin: 0 auto;
}
</style>
