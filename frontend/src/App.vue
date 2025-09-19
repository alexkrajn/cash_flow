<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'
import { useSocket } from '@/composables/useSocket'
import { useGameStore } from '@/stores/game'
import NotificationSystem from '@/components/NotificationSystem.vue'

const { connect, emit } = useSocket()
const gameStore = useGameStore()

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Handle socket reconnection
const handleSocketReconnected = async () => {
  console.log('Socket reconnected, attempting to restore player session...');
  
  // If we have stored player data, try to rejoin
  const storedData = gameStore.loadPlayerData();
  if (storedData && !gameStore.isPlayerJoined) {
    try {
      // Try to rejoin with stored data
      emit('join-game', {
        playerCode: storedData.code,
        playerName: storedData.name,
        profession: storedData.profession
      });
    } catch (error) {
      console.error('Failed to rejoin after reconnection:', error);
    }
  }
};

onMounted(() => {
  console.log('App mounted, connecting to socket');
  const socket = connect();
  console.log('Socket returned from connect:', socket);
  
  // Listen for socket reconnection events
  window.addEventListener('socket-reconnected', handleSocketReconnected);
});

onUnmounted(() => {
  window.removeEventListener('socket-reconnected', handleSocketReconnected);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-green-600 text-white shadow-md">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4 relative">
          <h1 class="text-xl sm:text-2xl font-semibold flex-1">Cash Flow Game</h1>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <nav 
        class="md:hidden fixed top-0 right-0 w-full h-screen bg-green-600 bg-opacity-95 backdrop-blur-sm flex-col justify-center items-center gap-8 transition-all duration-300 z-40"
        :class="{ 'translate-x-0': isMobileMenuOpen, 'translate-x-full': !isMobileMenuOpen }"
      >
        <router-link 
          to="/" 
          class="text-white text-xl px-8 py-4 w-48 text-center rounded transition-colors duration-200 font-medium"
          @click="closeMobileMenu"
        >
          Игра
        </router-link>
        <router-link 
          to="/admin" 
          class="text-white text-xl px-8 py-4 w-48 text-center rounded transition-colors duration-200 font-medium"
          @click="closeMobileMenu"
        >
          Админ
        </router-link>
      </nav>
    </header>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <RouterView />
    </main>
    
    <!-- Notification System -->
    <NotificationSystem />
  </div>
</template>

<style scoped>
/* Router link active state */
.router-link-active {
  @apply bg-white bg-opacity-20;
}
</style>
