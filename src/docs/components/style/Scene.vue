<!-- 场景组件 -->
<template>
    <div class="scene">
        <slot></slot>
    </div>
</template>

<style lang="css" scoped>
.scene {
    display: block;
    font-style: italic;
    color: #888;
    margin: 1.5em 0;
    padding-left: 1em;
    border-left: 2px solid var(--main-color-1);
}
</style>