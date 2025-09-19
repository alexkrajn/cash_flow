<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <main class="w-full">
    <!-- Tailwind CSS Test -->
    <div class="bg-red-500 text-white p-4 m-4 rounded-lg">
      <h1 class="text-2xl font-bold">Tailwind CSS Test</h1>
      <p class="text-lg">Если вы видите красный блок с белым текстом, Tailwind CSS работает!</p>
    </div>
    <TheWelcome />
  </main>
</template>
