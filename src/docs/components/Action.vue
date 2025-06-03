<!-- 动作组件 -->
<template>
    <div class="action">
        <slot></slot>
    </div>
</template>

<style scoped>
.action {
    background: rgba(0, 0, 0, 0.03);
    padding: 0.5rem;
    border-radius: 4px;
    margin: 1.2rem 1.5rem;
    font-size: 0.9em;
    border: 1px dashed rgba(0, 0, 0, 0.1);
    color:rgb(255, 162, 0);
  }
</style>