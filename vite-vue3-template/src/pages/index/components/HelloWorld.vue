<script setup>
defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      You’ve successfully created a project with Vite + Vue 3.
    </h3>
  </div>
</template>

<style scoped>
@import '@/assets/variables.css';
.greetings {
  & h3 {
    @mixin linesEllipsis 2;
    @apply --safe-area-inset-bottom;
  }
}
</style>
