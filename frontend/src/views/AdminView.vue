<template>
  <div class="max-w-6xl mx-auto">
    <div v-if="!gameStore.isAdmin" class="bg-white rounded-lg shadow-md border border-gray-200 p-6 max-w-md mx-auto my-8 text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Вход в панель ведущего</h2>
      <p class="text-gray-600 mb-6">Введите пароль ведущего для доступа к панели управления</p>
      <div class="space-y-4">
        <input
          v-model="adminPassword"
          type="password"
          placeholder="Пароль ведущего"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @keyup.enter="loginAsAdmin"
        />
        <button 
          @click="loginAsAdmin" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full min-h-12 text-lg font-semibold active:scale-95 touch-manipulation"
        >
          Войти как ведущий
        </button>
      </div>
    </div>
    
    <div v-else>
      <AdminPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/game';
import { useSocket } from '@/composables/useSocket';
import { useNotifications } from '@/composables/useNotifications';
import AdminPanel from '@/components/admin/AdminPanel.vue';
import type { GameAction } from '@/types';

const gameStore = useGameStore();
const { emit, on } = useSocket();
const { showError } = useNotifications();

const adminPassword = ref('');

const loginAsAdmin = () => {
  // Simple password check (in real app, this would be more secure)
  if (adminPassword.value === 'admin123') {
    console.log('Logging in as admin');
    gameStore.setAdminMode(true);
    console.log('Emitting admin-join event');
    emit('admin-join', undefined);
    setupAdminEventListeners();
  } else {
    showError('Ошибка', 'Неверный пароль ведущего');
  }
};

// Track if listeners are already set up to prevent duplication
let listenersSetup = false;

const setupAdminEventListeners = () => {
  if (listenersSetup) {
    console.log('Admin event listeners already set up, skipping');
    return;
  }
  
  console.log('Setting up admin event listeners');
  listenersSetup = true;
  
  // Listen for admin events
  on('admin-joined', (data) => {
    if (data.status === 'success') {
      console.log('Admin joined successfully');
    }
  });
  
  on('current-players', (players) => {
    console.log('Received current players:', players);
    gameStore.updatePlayers(players);
  });
  
  on('pending-actions', (actions: GameAction[]) => {
    console.log('Received pending actions event:', actions);
    console.log('Number of pending actions:', actions.length);
    // Clear existing pending actions first to prevent duplication
    gameStore.pendingActions.splice(0, gameStore.pendingActions.length);
    // Add all pending actions to the store
    actions.forEach((action: GameAction) => {
      console.log('Adding pending action to store:', action);
      gameStore.addPendingAction(action);
    });
    console.log('Total pending actions in store after adding:', gameStore.pendingActions.length);
  });
  
  on('player-joined', (data) => {
    console.log('Player joined event:', data);
    // Check if player already exists in store
    const existingPlayer = gameStore.players.find(p => p.code === data.playerCode);
    if (!existingPlayer) {
      // Only create new player if it doesn't exist
      const newPlayer = {
        id: '',
        code: data.playerCode,
        name: data.playerName,
        profession: data.profession,
        money: 0,
        assets: [],
        liabilities: [],
        income: data.profession.salary,
        expenses: data.profession.totalExpenses
      };
      gameStore.addPlayer(newPlayer);
    }
    // If player exists, we'll get updated data via player-updated event
  });
  
  on('player-left', (data) => {
    gameStore.removePlayer(data.playerCode);
  });
  
  on('action-request', (action) => {
    console.log('Received action request:', action);
    // Check if action already exists to prevent duplication
    const existingAction = gameStore.pendingActions.find(a => a.id === action.id);
    if (!existingAction) {
      gameStore.addPendingAction(action);
    }
  });
  
  on('action-processed', (data) => {
    console.log('Action processed by server:', data);
    console.log('Removing action with ID:', data.actionId);
    gameStore.removePendingAction(data.actionId);
  });
  
  on('player-updated', (data) => {
    gameStore.addPlayer(data.player);
  });
  
  on('player-removed', (data) => {
    gameStore.removePlayer(data.playerCode);
  });
};

onMounted(() => {
  console.log('AdminView mounted');
  // Always setup event listeners first
  setupAdminEventListeners();
  
  // Check if already admin (for page refresh)
  if (gameStore.isAdmin) {
    console.log('Already admin, emitting admin-join');
    emit('admin-join', undefined);
  }
});
</script>

