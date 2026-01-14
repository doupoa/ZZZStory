---
layout: page
footer: false
---
<div class="flex  flex-col">
  <div class="relative mx-auto mt-12 flex-1 px-6 lg:mt-20 lg:px-16">
    <div
      class="flex flex-col items-center lg:flex-row lg:items-center lg:gap-8"
    >
      <!-- 移动端顶部logo -->
      <div class="my-8 flex justify-center lg:hidden">
        <div class="relative">
          <div
            class="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-[#c8e700] to-[#ee7309] blur-[44px] sm:h-64 sm:w-64 lg:h-80 lg:w-80 lg:blur-[68px]"
          />
          <img
            src="/logo.png"
            alt="logo"
            class="relative left-1/2 top-1/2 h-48 w-48 max-h-48 max-w-48 -translate-x-1/2 -translate-y-1/2 object-contain sm:max-h-64 sm:max-w-[256px] lg:max-h-80 lg:max-w-[320px]"
          />
        </div>
      </div>
      <!-- 左侧文本内容 -->
      <div class="flex-1 text-center lg:text-left">
        <h1 class="mb-4 flex flex-col items-center lg:items-start">
          <span
            class="mb-2 bg-linear-to-r from-[#ee7309] to-[#c8e700] bg-clip-text text-7xl! font-bold text-transparent sm:text-5xl lg:text-6xl whitespace-nowrap"
          >
            绝区零故事汇
          </span>
          <span
            class="text-4xl font-bold text-white! sm:text-5xl lg:text-6xl whitespace-nowrap"
          >
            ZZZStory
          </span>
        </h1>
        <p
          class="my-5! max-w-[392px] text-lg text-(--vp-c-text-2) sm:text-xl lg:text-2xl lg:max-w-[592px] whitespace-nowrap"
        >
          旨在为剧情爱好者及资深游戏玩家提供完整的故事剧情
        </p>
        <div class="flex flex-wrap justify-center gap-3 lg:justify-start">
          <a
            href="/inter-knot/index"
            class="rounded-full px-5 py-2 text-center font-semibold text-white! dark:text-black! dark:hover:text-white! transition-colors bg-(--vp-button-brand-bg) hover:bg-(--vp-button-brand-hover-bg) sm:px-6"
          >
            登入绳网
          </a>
          <a
            href="/started"
            class="rounded-full border-2 px-5 py-2 text-center font-semibold text-white transition-colors hover:text-black! hover:bg-white sm:px-6 "
          >
            开始
          </a>
          <a
            href="https://zzz.mihoyo.com/main"
            target="_blank"
            rel="noreferrer"
            class="rounded-full border-2 px-5 py-2 text-center font-semibold text-white transition-colors hover:text-black! hover:bg-white sm:px-6 "
          >
            获取游戏
          </a>
        </div>
      </div>
      <!-- 右侧 logo -->
      <div class="hidden lg:flex mt-8 justify-center lg:mt-0 lg:ml-64 lg:flex-1">
        <div class="relative">
          <div
            class="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br from-[#c8e700] to-[#ee7309] blur-[44px] sm:h-64 sm:w-64 lg:h-80 lg:w-80 lg:blur-[68px]"
          />
          <img
            src="/logo.png"
            alt="logo"
            class="relative left-1/2 top-1/2 h-48 w-48 max-h-48 max-w-48 -translate-x-1/2 -translate-y-1/2 object-contain sm:max-h-64 sm:max-w-[256px] lg:max-h-80 lg:max-w-[320px]"
          />
        </div>
      </div>
    </div>
    </div>
    <footer class=" w-full py-6 fixed bottom-0">
      <div
        class="mx-auto max-w-6xl px-6 text-center text-sm text-(--vp-c-text-2) lg:px-16"
      >
        <p>
          本站所有内容（除
          <a
            href="https://www.mihoyo.com/"
            class="text-(--vp-c-text-1) hover:underline"
            >miHoYo</a
          >
          拥有的及另外声明的）均以遵循
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            class="text-(--vp-c-text-1) hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY-NC-SA 4.0
          </a>
          协议授权
        </p>
        <p class="mt-2">Copyright © {{new Date().getFullYear()}} ZZZStory</p>
      </div>
    </footer>
</div>
<!-- 全屏背景层 -->
<div v-if="isDark" class="fixed inset-0 -z-1 hidden lg:block">
  <ColorBends
    :rotation="0"
    :autoRotate="2"
    :speed="0.15"
    :scale="1.8"
    :frequency="1"
    :warp-strength="0.95"
    :mouse-influence="1"
    :parallax="0.5"
    :noise="0.1"
    :transparent="true"
    :background-image="'/pc-page-bg.png'"
  />
</div>


<script setup>
import { useData } from 'vitepress'
import ColorBends from '@/components/style/ColorBends.vue'
const { isDark } = useData()
</script>

<style>
@media (max-width: 899px) {
  .fixed.inset-0.-z-10 {
    display: none;
  }

  /* 添加移动端logo样式 */
  .lg\:flex-row {
    flex-direction: column-reverse;
  }

  .lg\:ml-16 {
    margin-left: 0;
    margin-top: 1rem;
  }
}
</style>