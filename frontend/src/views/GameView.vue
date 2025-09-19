<template>
  <div class="max-w-6xl mx-auto">
    <div v-if="!gameStore.isPlayerJoined" class="text-center py-8 px-4">
      <!-- Restoring profile state -->
      <div v-if="isRestoring || isCheckingPlayer" class="space-y-6">
        <h2 class="text-3xl font-bold text-gray-900">Восстановление профиля...</h2>
        <p class="text-lg text-gray-600">
          {{ isCheckingPlayer ? 'Проверяем существование игрока на сервере...' : 'Восстанавливаем ваш профиль...' }}
        </p>
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
      
      <div v-else-if="!playerCode" class="space-y-6">
        <h2 class="text-3xl font-bold text-gray-900">Добро пожаловать в Cash Flow!</h2>
        <p class="text-lg text-gray-600">Введите ваше имя, чтобы начать игру</p>
        <div class="max-w-md mx-auto">
          <input
            v-model="playerName"
            type="text"
            placeholder="Ваше имя"
            class="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @keyup.enter="generateCode"
          />
        </div>
        <button 
          @click="generateCode" 
          :disabled="isGenerating || !playerName.trim()"
          class="btn-primary min-h-12 min-w-48 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-95 touch-manipulation"
        >
          {{ isGenerating ? 'Генерация...' : 'Ввойти в игру' }}
        </button>
      </div>
      
      <div v-else-if="!selectedProfession" class="space-y-6">
        <ProfessionSelector @profession-selected="onProfessionSelected" />
      </div>
      
      <div v-else class="card max-w-lg mx-auto">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">Подтверждение входа в игру</h3>
        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p class="mb-2 text-gray-700"><strong>Имя игрока:</strong> {{ playerName }}</p>
          <p class="mb-2 text-gray-700"><strong>Код игрока:</strong> {{ playerCode }}</p>
          <p class="mb-2 text-gray-700"><strong>Профессия:</strong> {{ selectedProfession.name }}</p>
          <p class="text-gray-700"><strong>Описание:</strong> {{ selectedProfession.description }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            @click="joinGame" 
            :disabled="isJoining" 
            class="btn-primary min-h-12 min-w-48 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-95 touch-manipulation"
          >
            {{ isJoining ? 'Подключение...' : 'Войти в игру' }}
          </button>
          <button 
            @click="resetSelection" 
            class="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 min-h-12 min-w-36 active:scale-95 touch-manipulation"
          >
            Начать заново
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="space-y-8">
      <PlayerCard :player="gameStore.currentPlayer" />
      <!-- Disconnected user notification -->
      <div v-if="gameStore.currentPlayer?.isConnected === false" class="card bg-red-50 border-red-200">
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div>
              <h4 class="font-semibold text-red-800">Соединение потеряно</h4>
              <p class="text-sm text-red-700">Вы отключены от сервера. Игровые действия недоступны.</p>
            </div>
          </div>
          <button 
            @click="toggleConnectionStatus"
            class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Подключиться
          </button>
        </div>
      </div>
      
      <div class="card">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Игровые действия</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors duration-200 min-h-12 touch-manipulation active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400" 
            @click="showActionModal('buy-asset')"
            :disabled="gameStore.currentPlayer?.isConnected === false"
          >
            Купить актив
          </button>
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors duration-200 min-h-12 touch-manipulation active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400" 
            @click="showActionModal('sell-asset')"
            :disabled="gameStore.currentPlayer?.isConnected === false"
          >
            Продать актив
          </button>
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors duration-200 min-h-12 touch-manipulation active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400" 
            @click="showActionModal('take-loan')"
            :disabled="gameStore.currentPlayer?.isConnected === false"
          >
            Взять кредит
          </button>
          <button 
            class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors duration-200 min-h-12 touch-manipulation active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400" 
            @click="showActionModal('pay-loan')"
            :disabled="gameStore.currentPlayer?.isConnected === false"
          >
            Погасить кредит
          </button>
          <button 
            class="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors duration-200 min-h-12 touch-manipulation active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400" 
            @click="showActionModal('request-money')"
            :disabled="gameStore.currentPlayer?.isConnected === false"
          >
            Запросить деньги
          </button>
          <button 
            class="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-4 rounded-lg transition-colors duration-200 min-h-12 touch-manipulation active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400" 
            @click="showActionModal('transfer-money')"
            :disabled="gameStore.currentPlayer?.isConnected === false"
          >
            Перевести деньги
          </button>
        </div>
      </div>
    </div>
    
    <!-- Action Modal -->
    <ActionModal
      :is-open="isActionModalOpen"
      :action="currentAction"
      @close="closeActionModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/game';
import { useSocket } from '@/composables/useSocket';
import { useNotifications } from '@/composables/useNotifications';
import { generatePlayerCode } from '@/utils/api';
import ProfessionSelector from '@/components/player/ProfessionSelector.vue';
import PlayerCard from '@/components/player/PlayerCard.vue';
import ActionModal from '@/components/player/ActionModal.vue';
import type { Profession } from '@/types';

const gameStore = useGameStore();
const { emit, on, off } = useSocket();
const { showError, showSuccess, showInfo } = useNotifications();

const isGenerating = ref(false);
const isJoining = ref(false);
const isActionModalOpen = ref(false);
const currentAction = ref('');
const playerName = ref('');
const isRestoring = ref(false);
const isCheckingPlayer = ref(false);

const playerCode = computed(() => gameStore.playerCode);
const selectedProfession = computed(() => gameStore.selectedProfession);

// Check if player exists on server
const checkPlayerExists = (playerCode: string): Promise<boolean> => {
  console.log('Checking if player exists:', playerCode);
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('Player existence check timeout');
      resolve(false);
    }, 5000);

    const handlePlayerData = (data: any) => {
      console.log('Received player data during existence check:', data);
      clearTimeout(timeout);
      off('player-data-updated', handlePlayerData);
      resolve(!!data.player);
    };

    on('player-data-updated', handlePlayerData);
    emit('get-player-data' as any, { playerCode });
  });
};

// Restore player profile from localStorage
const restorePlayerProfile = async () => {
  console.log('Restoring player profile');
  const storedData = gameStore.loadPlayerData();
  if (!storedData) {
    console.log('No stored player data found');
    return false;
  }

  console.log('Found stored player data:', storedData);
  isRestoring.value = true;
  isCheckingPlayer.value = true;

  try {
    // Check if player still exists on server
    const playerExists = await checkPlayerExists(storedData.code);
    console.log('Player exists on server:', playerExists);
    
    if (playerExists) {
      // Restore player data
      console.log('Restoring player data');
      gameStore.setPlayerCode(storedData.code);
      gameStore.setSelectedProfession(storedData.profession);
      playerName.value = storedData.name;
      
      // Try to rejoin the game - server will send actual player data
      console.log('Attempting to rejoin game');
      await attemptRejoin(storedData);
      console.log('Successfully rejoined game');
      return true;
    } else {
      // Player no longer exists on server, clear stored data
      console.log('Player no longer exists on server, clearing stored data');
      gameStore.clearPlayerData();
      return false;
    }
  } catch (error) {
    console.error('Error restoring player profile:', error);
    gameStore.clearPlayerData();
    return false;
  } finally {
    isRestoring.value = false;
    isCheckingPlayer.value = false;
  }
};

// Attempt to rejoin the game with stored data
const attemptRejoin = async (storedData: { code: string; name: string; profession: Profession }) => {
  console.log('Attempting to rejoin with stored data:', storedData);
  
  // Ensure socket is connected first
  const { connect } = useSocket();
  connect();
  
  // Wait for connection with timeout
  await new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait
    
    const checkConnection = () => {
      attempts++;
      const { socket } = useSocket();
      if (socket?.connected) {
        console.log('Socket connected, proceeding with rejoin');
        resolve(true);
      } else if (attempts < maxAttempts) {
        setTimeout(checkConnection, 100);
      } else {
        console.error('Failed to establish socket connection for rejoin');
        reject(new Error('Socket connection timeout'));
      }
    };
    checkConnection();
  });
  
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log('Rejoin timeout');
      reject(new Error('Rejoin timeout'));
    }, 15000);

    const handleJoinedGame = (data: any) => {
      console.log('Received joined-game during rejoin:', data);
      if (data.playerCode === storedData.code) {
        clearTimeout(timeout);
        off('joined-game', handleJoinedGame);
        off('player-data-updated', handlePlayerDataUpdated);
        resolve();
      }
    };

    const handlePlayerDataUpdated = (data: any) => {
      console.log('Received player-data-updated during rejoin:', data);
      if (data.player && data.player.code === storedData.code) {
        clearTimeout(timeout);
        off('joined-game', handleJoinedGame);
        off('player-data-updated', handlePlayerDataUpdated);
        resolve();
      }
    };

    on('joined-game', handleJoinedGame);
    on('player-data-updated', handlePlayerDataUpdated);
    
    // Emit join game event with stored data
    console.log('Emitting join-game for rejoin:', {
      playerCode: storedData.code,
      playerName: storedData.name,
      profession: storedData.profession
    });
    emit('join-game', {
      playerCode: storedData.code,
      playerName: storedData.name,
      profession: storedData.profession
    });
  });
};

const generateCode = async () => {
  console.log('Generating player code');
  isGenerating.value = true;
  try {
    const response = await generatePlayerCode();
    console.log('Generated player code:', response.playerCode);
    gameStore.setPlayerCode(response.playerCode);
  } catch (error) {
    console.error('Failed to generate player code:', error);
    showError('Ошибка', 'Ошибка при генерации кода игрока');
  } finally {
    isGenerating.value = false;
  }
};

const onProfessionSelected = (profession: Profession) => {
  console.log('Profession selected:', profession);
  gameStore.setSelectedProfession(profession);
};

const joinGame = async () => {
  if (!playerCode.value || !selectedProfession.value) return;
  
  console.log('Joining game with:', {
    playerCode: playerCode.value,
    playerName: playerName.value,
    profession: selectedProfession.value
  });
  
  isJoining.value = true;
  
  // Ensure socket is connected first
  const { connect } = useSocket();
  connect();
  
  // Wait for connection with timeout
  await new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait
    
    const checkConnection = () => {
      attempts++;
      const { socket } = useSocket();
      if (socket?.connected) {
        console.log('Socket connected, proceeding with join game');
        resolve(true);
      } else if (attempts < maxAttempts) {
        setTimeout(checkConnection, 100);
      } else {
        console.error('Failed to establish socket connection');
        reject(new Error('Socket connection timeout'));
      }
    };
    checkConnection();
  });
  
  // Set up timeout to handle connection issues
  const timeout = setTimeout(() => {
    if (isJoining.value) {
      console.log('Join game timeout - no response from server');
      isJoining.value = false;
      showError('Ошибка', 'Не удалось подключиться к игре. Попробуйте еще раз.');
      off('joined-game', handleJoinedGame);
      off('player-data-updated', handlePlayerDataForJoin);
    }
  }, 15000); // 15 second timeout
  
  // Set up handler for player data during join
  const handlePlayerDataForJoin = (data: any) => {
    console.log('Received player data during join:', data);
    if (data.player && data.player.code === playerCode.value) {
      clearTimeout(timeout);
      off('joined-game', handleJoinedGame);
      off('player-data-updated', handlePlayerDataForJoin);
      gameStore.joinGame(data.player);
      isJoining.value = false;
      console.log('Successfully joined game with player data');
    }
  };
  
  // Set up the event listener for join confirmation
  const handleJoinedGame = (data: any) => {
    console.log('Received joined-game event:', data);
    if (data.playerCode === playerCode.value) {
      console.log('Successfully joined game, waiting for player data...');
      // Don't remove the listener here - we need to wait for player data
      // The player data handler will clean up both listeners
    }
  };
  
  // Listen for both events BEFORE emitting
  on('joined-game', handleJoinedGame);
  on('player-data-updated', handlePlayerDataForJoin);
  
  // Emit join game event
  if (selectedProfession.value) {
    console.log('Emitting join-game event:', {
      playerCode: playerCode.value,
      playerName: playerName.value,
      profession: selectedProfession.value
    });
    
    // Emit the join-game event
    emit('join-game', {
      playerCode: playerCode.value,
      playerName: playerName.value,
      profession: selectedProfession.value
    });
  }
};

const resetSelection = () => {
  console.log('Resetting selection');
  playerName.value = '';
  gameStore.clearGameData();
};

const showActionModal = (action: string) => {
  console.log('Showing action modal for:', action);
  currentAction.value = action;
  isActionModalOpen.value = true;
};

const closeActionModal = () => {
  console.log('Closing action modal');
  isActionModalOpen.value = false;
  currentAction.value = '';
};

// Temporary function for testing connection status
const toggleConnectionStatus = () => {
  if (gameStore.currentPlayer) {
    gameStore.currentPlayer.isConnected = !gameStore.currentPlayer.isConnected;
  }
};

// Action mapping for readable names
const getActionDisplayName = (action: string): string => {
  const actionNames: Record<string, string> = {
    'buy-asset': 'Покупка актива',
    'sell-asset': 'Продажа актива',
    'take-loan': 'Взятие кредита',
    'pay-loan': 'Погашение кредита',
    'request-money': 'Запрос денег у банка',
    'transfer-money': 'Перевод денег игроку'
  };
  return actionNames[action] || action;
};

// Event listener references to prevent duplicates
let eventListenersSetup = false;

// Setup event listeners function
const setupEventListeners = () => {
  if (eventListenersSetup) {
    console.log('Event listeners already setup, skipping');
    return;
  }
  
  console.log('Setting up event listeners for GameView');
  eventListenersSetup = true;
  
  // Listen for action results
  on('action-result', (data: any) => {
    console.log('Received action result:', data);
    console.log('Action result timestamp:', new Date().toISOString());
    console.log('Current player code:', gameStore.playerCode);
    
    if (data.approved) {
      // Special handling for transfer success
      if (data.action === 'transfer-money' && data.details?.transferSuccess) {
        showSuccess('Перевод выполнен!', `Сумма: ${data.details.amount}₽\nПолучатель: ${data.details.recipientName}\nПричина: ${data.details.reason || 'Перевод'}`);
      } else {
        showSuccess('Действие одобрено!', `Действие "${getActionDisplayName(data.action)}" одобрено!`);
      }
      // Request updated player data from server
      console.log('Requesting updated player data for:', gameStore.playerCode);
      emit('get-player-data' as any, { playerCode: gameStore.playerCode });
    } else {
      showError('Действие отклонено', `Действие "${getActionDisplayName(data.action)}" отклонено: ${data.reason}`);
    }
  });

  // Listen for action submitted confirmation
  on('action-submitted', (data: any) => {
    console.log('Action submitted confirmation:', data);
  });

  // Listen for updated player data
  on('player-data-updated' as any, (data: any) => {
    console.log('Received updated player data:', data);
    if (data.player && data.player.code === gameStore.playerCode) {
      console.log('Updating player data in store:', {
        code: data.player.code,
        money: data.player.money,
        income: data.player.income,
        expenses: data.player.expenses,
        assetsCount: data.player.assets.length,
        liabilitiesCount: data.player.liabilities.length
      });
      gameStore.joinGame(data.player);
      console.log('Player joined game with updated data');
    } else {
      console.log('Player data received but code mismatch:', data.player?.code, 'vs', gameStore.playerCode);
    }
  });

  // Listen for pending updates notification
  on('pending-updates-notification' as any, (data: any) => {
    console.log('Received pending updates notification:', data);
    showInfo('Уведомление', data.message);
  });

  // Listen for money received notification (transfers)
  on('money-received' as any, (data: any) => {
    console.log('Received money notification:', data);
    showSuccess('Перевод получен!', `Сумма: ${data.amount}₽\nОт: ${data.fromPlayer}\nПричина: ${data.reason}`);
  });

  // Listen for game reset notification
  on('game-reset' as any, (data: any) => {
    console.log('Received game reset notification:', data);
    showError('Игра сброшена', data.reason || 'Игра была сброшена ведущим. Все данные очищены.');
    
    // Clear local game data and redirect to initial state
    gameStore.clearGameData();
    
    // Reset component state
    playerName.value = '';
    gameStore.setPlayerCode('');
    gameStore.setSelectedProfession(null);
    isActionModalOpen.value = false;
    currentAction.value = '';
  });
};

// Setup event listeners immediately
setupEventListeners();

// Auto-restore player profile on mount
onMounted(async () => {
  console.log('GameView mounted');
  if (!gameStore.isPlayerJoined) {
    const restored = await restorePlayerProfile();
    if (!restored) {
      console.log('No stored player data found or player no longer exists on server');
    }
  } else {
    console.log('Player already joined, skipping profile restoration');
  }
});

// Reset event listeners flag on unmount
onUnmounted(() => {
  console.log('GameView unmounted, resetting event listeners flag');
  eventListenersSetup = false;
});
</script>

