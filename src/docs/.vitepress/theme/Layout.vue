<!-- .vitepress/theme/Layout.vue -->
<template>
  <Layout>
    <template #not-found>
      <div class="py-16 md:py-24 text-center">
        <img
          :src="isDark ? error_404_dark : error_404"
          class="mx-auto w-64"
          alt="404"
        />
        <p class="mt-8 text-2xl font-semibold">嗯呢嗯呢呢!（资料不见啦！）</p>
        <h1 class="mt-3 text-lg font-bold tracking-widest">PAGE NOT FOUND</h1>
        <div class="mx-auto my-6 h-px w-16 bg-(--vp-c-divider)" />
        <a
          href="/started"
          class="inline-block rounded-full border border-(--vp-c-brand-1) px-4 py-1 text-base font-medium text-(--vp-c-brand-1) transition hover:border-(--vp-c-brand-2) hover:text-(--vp-c-brand-2)"
        >
          回到索引
        </a>
      </div>
    </template>
  </Layout>
</template>

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
    `circle(${Math.hypot(innerWidth, innerHeight) * 1.05}px at ${x}px ${y}px)`,
  ];

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value;
    await nextTick();
  }).ready;

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 600,
      easing: "ease-in-out",
      fill: "forwards",
      pseudoElement: `::view-transition-${isDark.value ? "old" : "new"}(root)`,
    },
  );
});
</script>

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
</style>
