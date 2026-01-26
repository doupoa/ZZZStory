---
title: 驱动盘评级系统
description: 智能分析您的驱动盘配置，计算综合评分
layout: page
footer: false
---

<ClientOnly>
  <DriveRatingApp />
</ClientOnly>

<script setup>
import DriveRatingApp from './components/DriveRatingApp.vue'
</script>

<style>
:root {
  --main-color-1: #ee7309;
  --main-color-2: #b45400;
}
</style>
