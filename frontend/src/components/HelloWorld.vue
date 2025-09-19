<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="text-center lg:text-left">
    <h1 class="text-4xl lg:text-5xl font-medium text-primary-600 mb-4 relative -top-2">{{ msg }}</h1>
    <h3 class="text-lg lg:text-xl text-gray-700">
      You've successfully created a project with
      <a href="https://vite.dev/" target="_blank" rel="noopener" class="link">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener" class="link">Vue 3</a>. What's next?
    </h3>
  </div>
</template>

