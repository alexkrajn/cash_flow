<template>
  <div class="max-w-6xl mx-auto py-8 px-4">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b-2 border-gray-200">
      <h1 class="text-2xl font-bold text-gray-900 m-0">Панель ведущего</h1>
      <div class="flex items-center gap-4 mt-4 sm:mt-0">
        <button 
          @click="confirmClearAllData" 
          class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 active:scale-95 touch-manipulation flex items-center gap-2"
          :disabled="isClearingData"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          {{ isClearingData ? 'Очистка...' : 'Очистить все данные' }}
        </button>
        <div 
          class="px-4 py-2 rounded-full font-semibold text-sm"
          :class="{ 'bg-green-600 text-white': isConnected, 'bg-red-600 text-white': !isConnected }"
        >
          {{ isConnected ? 'Подключено' : 'Отключено' }}
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6 m-0">Игроки ({{ players.length }})</h2>
        <div v-if="players.length" class="space-y-4">
          <div
            v-for="player in players"
            :key="player.code"
            class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <!-- Player header -->
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {{ player.name ? player.name.charAt(0).toUpperCase() : '?' }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <div class="font-semibold text-gray-900">{{ player.name || 'Без имени' }}</div>
                  <div class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ${{ player.money.toLocaleString() }}
                  </div>
                </div>
                <div class="text-sm text-gray-500">{{ player.code }}</div>
              </div>
              <button 
                @click="confirmDeletePlayer(player)" 
                class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                title="Удалить игрока"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>

            <!-- Player stats -->
            <div class="grid grid-cols-3 gap-3 mb-3 text-center">
              <div class="bg-green-50 rounded-lg p-2">
                <div class="text-xs text-gray-600">Доходы</div>
                <div class="font-semibold text-green-600 text-sm">${{ getTotalIncome(player).toLocaleString() }}</div>
              </div>
              <div class="bg-red-50 rounded-lg p-2">
                <div class="text-xs text-gray-600">Расходы</div>
                <div class="font-semibold text-red-600 text-sm">${{ getTotalExpenses(player).toLocaleString() }}</div>
              </div>
              <div class="bg-green-50 rounded-lg p-2">
                <div class="text-xs text-gray-600">Денежный поток</div>
                <div class="font-semibold text-sm" :class="getCashFlowClass(player)">
                  ${{ getCashFlow(player).toLocaleString() }}
                </div>
              </div>
            </div>

            <!-- Assets, liabilities and children summary -->
            <div class="grid grid-cols-3 gap-3 mb-3 text-center">
              <div class="bg-green-50 rounded-lg p-2">
                <div class="text-xs text-gray-600">Активы</div>
                <div class="font-semibold text-green-600 text-sm">{{ player.assets.length }}</div>
              </div>
              <div class="bg-red-50 rounded-lg p-2">
                <div class="text-xs text-gray-600">Кредиты</div>
                <div class="font-semibold text-red-600 text-sm">{{ player.liabilities.length }}</div>
              </div>
              <div class="bg-blue-50 rounded-lg p-2">
                <div class="text-xs text-gray-600">Дети</div>
                <div class="font-semibold text-blue-600 text-sm">{{ player.children || 0 }}</div>
              </div>
            </div>

            <!-- Money controls -->
            <div class="mb-3">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm font-medium text-gray-700">Управление деньгами:</span>
              </div>
              
              <!-- Quick amount buttons -->
              
              <!-- Custom amount input -->
              <div class="flex gap-2">
                <input
                  :value="getCustomAmount(player.code)"
                  @input="setCustomAmount(player.code, ($event.target as HTMLInputElement).value)"
                  type="number"
                  placeholder="Сумма"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="1"
                />
                <button 
                  @click="addCustomMoney(player)" 
                  class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded text-sm transition-colors duration-200 active:scale-95 touch-manipulation"
                >
                  Добавить
                </button>
                <button 
                  @click="subtractCustomMoney(player)" 
                  class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded text-sm transition-colors duration-200 active:scale-95 touch-manipulation"
                >
                  Убрать
                </button>
              </div>
            </div>

            <!-- Children controls -->
            <div class="mb-3">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm font-medium text-gray-700">Управление детьми:</span>
              </div>
              
              <div class="flex gap-2">
                <button 
                  @click="addChild(player)" 
                  class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded text-sm transition-colors duration-200 active:scale-95 touch-manipulation"
                  :disabled="(player.children || 0) >= 5"
                >
                  + Ребенок
                </button>
                <button 
                  @click="removeChild(player)" 
                  class="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 rounded text-sm transition-colors duration-200 active:scale-95 touch-manipulation"
                  :disabled="(player.children || 0) <= 0"
                >
                  - Ребенок
                </button>
                <div class="flex-1 bg-gray-50 rounded-lg p-2 text-center">
                  <div class="text-xs text-gray-600">Расходы на детей</div>
                  <div class="font-semibold text-orange-600 text-sm">
                    ${{ getChildrenExpenses(player).toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div v-else class="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
          <p class="text-lg font-medium mb-2">Нет подключенных игроков</p>
          <p class="text-sm">Игроки пока не присоединились к игре</p>
        </div>
      </div>
      
      <div class="card">
        <h2 class="text-xl font-semibold text-gray-900 mb-6 m-0">Запросы на действия ({{ pendingActions.length }})</h2>
        <div v-if="pendingActions.length" class="space-y-6">
          <ActionRequestCard
            v-for="action in pendingActions"
            :key="action.id"
            :action="action"
            :player="getPlayerByCode(action.playerCode)"
            :all-players="players"
            @approve="approveAction"
            @reject="rejectAction"
          />
        </div>
        <div v-else class="text-center text-gray-500 italic p-8 bg-gray-50 rounded-lg">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-lg font-medium mb-2">Нет ожидающих запросов</p>
          <p class="text-sm">Игроки пока не отправили запросы на действия</p>
        </div>
      </div>
    </div>
    

    <!-- Delete Confirmation Modal -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Подтверждение удаления</h3>
        <p class="text-gray-600 mb-6">
          Вы уверены, что хотите удалить игрока 
          <span class="font-semibold text-red-600">{{ playerToDelete?.code }}</span>
          {{ playerToDelete?.name ? `(${playerToDelete.name})` : '' }}?
        </p>
        <p class="text-sm text-gray-500 mb-6">
          Это действие нельзя отменить. Игрок будет отключен от игры и удален из сессии.
        </p>
        <div class="flex gap-3 justify-end">
          <button 
            @click="closeDeleteModal" 
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Отмена
          </button>
          <button 
            @click="deletePlayer" 
            class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
            :disabled="isDeleting"
          >
            {{ isDeleting ? 'Удаление...' : 'Удалить' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Clear All Data Confirmation Modal -->
    <div v-if="isClearDataModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Очистка всех данных</h3>
        </div>
        <p class="text-gray-600 mb-4">
          Вы уверены, что хотите очистить все данные игры?
        </p>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-red-800 font-medium mb-2">Это действие удалит:</p>
          <ul class="text-sm text-red-700 space-y-1">
            <li>• Всех игроков и их данные</li>
            <li>• Все активы и кредиты</li>
            <li>• Все ожидающие запросы</li>
            <li>• Все игровые сессии</li>
          </ul>
        </div>
        <p class="text-sm text-gray-500 mb-6">
          <strong>Внимание:</strong> Это действие нельзя отменить. Все игроки будут отключены от игры.
        </p>
        <div class="flex gap-3 justify-end">
          <button 
            @click="closeClearDataModal" 
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            :disabled="isClearingData"
          >
            Отмена
          </button>
          <button 
            @click="clearAllData" 
            class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 flex items-center gap-2"
            :disabled="isClearingData"
          >
            <svg v-if="isClearingData" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {{ isClearingData ? 'Очистка...' : 'Очистить все данные' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '@/stores/game';
import { useSocket } from '@/composables/useSocket';
import { useNotifications } from '@/composables/useNotifications';
import { updatePlayer, deletePlayer as deletePlayerAPI, clearAllData as clearAllDataAPI } from '@/utils/api';
import ActionRequestCard from './ActionRequestCard.vue';
import type { GameAction, Player } from '@/types';

const gameStore = useGameStore();
const { isConnected, emit, on } = useSocket();
const { showError, showWarning, showSuccess } = useNotifications();

const players = computed(() => gameStore.players);
const pendingActions = computed(() => gameStore.pendingActions);


const isDeleteModalOpen = ref(false);
const playerToDelete = ref<Player | null>(null);
const isDeleting = ref(false);
const customAmounts = ref<Record<string, number>>({});

// Clear all data modal state
const isClearDataModalOpen = ref(false);
const isClearingData = ref(false);

const getCustomAmount = (playerCode: string): number => {
  return customAmounts.value[playerCode] || 0;
};

const setCustomAmount = (playerCode: string, value: string) => {
  const numValue = parseFloat(value) || 0;
  customAmounts.value[playerCode] = numValue;
};

const getActionName = (action: string) => {
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

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString();
};

const getPlayerName = (playerCode: string) => {
  const player = players.value.find(p => p.code === playerCode);
  return player?.name ? player.name : 'Без имени';
};

const getPlayerByCode = (playerCode: string) => {
  return players.value.find(p => p.code === playerCode);
};

const getTotalIncome = (player: Player) => {
  const baseIncome = player.income;
  // Add only positive cash flow from assets to income
  const positiveAssetCashFlow = player.assets.reduce((sum, asset) => 
    sum + ((asset.cashFlow || 0) > 0 ? (asset.cashFlow || 0) : 0), 0);
  
  return baseIncome + positiveAssetCashFlow;
};

const getTotalExpenses = (player: Player) => {
  const baseExpenses = player.expenses;
  // Add negative cash flow from assets to expenses (as costs)
  const negativeAssetCashFlow = player.assets.reduce((sum, asset) => 
    sum + ((asset.cashFlow || 0) < 0 ? Math.abs(asset.cashFlow || 0) : 0), 0);
  const liabilityPayments = player.liabilities.reduce((sum, liability) => sum + liability.monthlyPayment, 0);
  const childrenExpenses = getChildrenExpenses(player);
  
  return baseExpenses + negativeAssetCashFlow + liabilityPayments + childrenExpenses;
};

const getCashFlow = (player: Player) => {
  // Use the same logic as getTotalIncome and getTotalExpenses to avoid double counting
  return getTotalIncome(player) - getTotalExpenses(player);
};

const getCashFlowClass = (player: Player) => {
  const flow = getCashFlow(player);
  if (flow > 0) return 'text-green-600';
  if (flow < 0) return 'text-red-600';
  return 'text-gray-600';
};

const getChildrenExpenses = (player: Player) => {
  const childrenCount = player.children || 0;
  const childExpensesPerChild = player.profession?.childExpenses || 640;
  return childrenCount * childExpensesPerChild;
};

const addMoney = async (player: Player, amount: number) => {
  try {
    const updatedPlayer = {
      ...player,
      money: player.money + amount
    };
    
    console.log('Adding money to player:', {
      code: player.code,
      amount: amount,
      oldMoney: player.money,
      newMoney: updatedPlayer.money
    });
    
    const result = await updatePlayer(player.code, updatedPlayer);
    console.log('Update API response:', result);
    
    gameStore.addPlayer(updatedPlayer);
    console.log('Player money updated successfully');
  } catch (error) {
    console.error('Failed to add money to player:', error);
    showError('Ошибка', 'Ошибка при добавлении денег игроку');
  }
};

const subtractMoney = async (player: Player, amount: number) => {
  try {
    const newAmount = Math.max(0, player.money - amount); // Prevent negative money
    const updatedPlayer = {
      ...player,
      money: newAmount
    };
    
    console.log('Subtracting money from player:', {
      code: player.code,
      amount: amount,
      oldMoney: player.money,
      newMoney: updatedPlayer.money
    });
    
    const result = await updatePlayer(player.code, updatedPlayer);
    console.log('Update API response:', result);
    
    gameStore.addPlayer(updatedPlayer);
    console.log('Player money updated successfully');
  } catch (error) {
    console.error('Failed to subtract money from player:', error);
    showError('Ошибка', 'Ошибка при уменьшении денег игрока');
  }
};

const addCustomMoney = async (player: Player) => {
  const amount = getCustomAmount(player.code);
  if (!amount || amount <= 0) {
    showWarning('Предупреждение', 'Введите корректную сумму');
    return;
  }
  
  await addMoney(player, amount);
  setCustomAmount(player.code, '0'); // Clear input after successful operation
};

const subtractCustomMoney = async (player: Player) => {
  const amount = getCustomAmount(player.code);
  if (!amount || amount <= 0) {
    showWarning('Предупреждение', 'Введите корректную сумму');
    return;
  }
  
  await subtractMoney(player, amount);
  setCustomAmount(player.code, '0'); // Clear input after successful operation
};

const addChild = async (player: Player) => {
  const currentChildren = player.children || 0;
  if (currentChildren >= 5) {
    showWarning('Предупреждение', 'Максимальное количество детей: 5');
    return;
  }
  
  try {
    const updatedPlayer = {
      ...player,
      children: currentChildren + 1
    };
    
    console.log('Adding child to player:', {
      code: player.code,
      oldChildren: currentChildren,
      newChildren: updatedPlayer.children
    });
    
    const result = await updatePlayer(player.code, updatedPlayer);
    console.log('Update API response:', result);
    
    gameStore.addPlayer(updatedPlayer);
    console.log('Player children updated successfully');
  } catch (error) {
    console.error('Failed to add child to player:', error);
    showError('Ошибка', 'Ошибка при добавлении ребенка');
  }
};

const removeChild = async (player: Player) => {
  const currentChildren = player.children || 0;
  if (currentChildren <= 0) {
    showWarning('Предупреждение', 'У игрока нет детей');
    return;
  }
  
  try {
    const updatedPlayer = {
      ...player,
      children: Math.max(0, currentChildren - 1)
    };
    
    console.log('Removing child from player:', {
      code: player.code,
      oldChildren: currentChildren,
      newChildren: updatedPlayer.children
    });
    
    const result = await updatePlayer(player.code, updatedPlayer);
    console.log('Update API response:', result);
    
    gameStore.addPlayer(updatedPlayer);
    console.log('Player children updated successfully');
  } catch (error) {
    console.error('Failed to remove child from player:', error);
    showError('Ошибка', 'Ошибка при удалении ребенка');
  }
};

const approveAction = (action: GameAction) => {
  console.log('Approving action:', action);
  emit('admin-response', {
    actionId: action.id,
    playerCode: action.playerCode,
    action: action.action,
    approved: true,
    details: action.details
  });
  
  // Don't remove immediately - wait for server confirmation
  // gameStore.removePendingAction(action.id);
};

const rejectAction = (action: GameAction) => {
  console.log('Rejecting action:', action);
  emit('admin-response', {
    actionId: action.id,
    playerCode: action.playerCode,
    action: action.action,
    approved: false,
    details: { reason: 'Действие отклонено ведущим' }
  });
  
  // Don't remove immediately - wait for server confirmation
  // gameStore.removePendingAction(action.id);
};

const confirmDeletePlayer = (player: Player) => {
  playerToDelete.value = player;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
  playerToDelete.value = null;
  isDeleting.value = false;
};

const deletePlayer = async () => {
  if (!playerToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    await deletePlayerAPI(playerToDelete.value.code);
    gameStore.removePlayer(playerToDelete.value.code);
    console.log('Player deleted successfully:', playerToDelete.value.code);
    closeDeleteModal();
  } catch (error) {
    console.error('Failed to delete player:', error);
    showError('Ошибка', 'Ошибка при удалении игрока');
    isDeleting.value = false;
  }
};

// Clear all data functions
const confirmClearAllData = () => {
  isClearDataModalOpen.value = true;
};

const closeClearDataModal = () => {
  isClearDataModalOpen.value = false;
  isClearingData.value = false;
};

const clearAllData = async () => {
  isClearingData.value = true;
  
  try {
    console.log('Clearing all game data...');
    const result = await clearAllDataAPI();
    console.log('All data cleared successfully:', result);
    
    // Clear local game store data
    gameStore.clearGameData();
    
    // Close modal
    closeClearDataModal();
    
    // Show success notification
    showSuccess('Успех', 'Все данные игры успешно очищены');
    
  } catch (error) {
    console.error('Failed to clear all data:', error);
    showError('Ошибка', 'Ошибка при очистке данных игры');
    isClearingData.value = false;
  }
};

// Listen for game reset events from server
on('game-reset', (data) => {
  console.log('Received game-reset event:', data);
  
  // Clear local game store data
  gameStore.clearGameData();
  
  // Show notification to admin
  showSuccess('Игра сброшена', data.message || 'Все данные игры очищены');
  
  // Close modal if it's open
  if (isClearDataModalOpen.value) {
    closeClearDataModal();
  }
});
</script>

