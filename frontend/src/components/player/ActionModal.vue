<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
    <div class="bg-white rounded-xl w-11/12 max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl m-4 sm:m-8" @click.stop>
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900 m-0">{{ getActionTitle() }}</h3>
        <button @click="closeModal" class="bg-transparent border-none text-2xl cursor-pointer text-gray-600 p-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200">
          &times;
        </button>
      </div>
      
      <div class="p-6">
        <!-- Buy Asset -->
        <div v-if="action === 'buy-asset'" class="space-y-4">
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Тип актива:</label>
            <select v-model="formData.assetType" class="input-field">
              <option value="real-estate">Недвижимость</option>
              <option value="business">Бизнес</option>
              <option value="stock">Акции</option>
            </select>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Название актива:</label>
            <input v-model="formData.name" type="text" class="input-field" placeholder="Например: Квартира в центре">
          </div>
          
          <!-- Поля для недвижимости -->
          <template v-if="formData.assetType === 'real-estate'">
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-900 text-sm">Стоимость актива:</label>
              <input v-model.number="formData.value" type="number" class="input-field" placeholder="100000">
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-900 text-sm">Тип покупки:</label>
              <select v-model="formData.purchaseType" class="input-field">
                <option value="down-payment">Первоначальный взнос</option>
                <option value="full-payment">Полная оплата</option>
              </select>
            </div>
            
            <div v-if="formData.purchaseType === 'down-payment'" class="flex flex-col gap-2">
              <label class="font-semibold text-gray-900 text-sm">Первоначальный взнос:</label>
              <input v-model.number="formData.downPayment" type="number" class="input-field" placeholder="20000">
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-900 text-sm">Ежемесячный денежный поток:</label>
              <input v-model.number="formData.cashFlow" type="number" class="input-field" placeholder="500 (может быть отрицательным)">
              <p class="text-xs text-gray-500">Положительное значение = доход, отрицательное = расход</p>
            </div>
          </template>
          
          <!-- Поля для бизнеса -->
          <template v-else-if="formData.assetType === 'business'">
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-900 text-sm">Стоимость актива:</label>
              <input v-model.number="formData.value" type="number" class="input-field" placeholder="50000">
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-900 text-sm">Ежемесячный денежный поток:</label>
              <input v-model.number="formData.cashFlow" type="number" class="input-field" placeholder="2000 (может быть отрицательным)">
              <p class="text-xs text-gray-500">Положительное значение = доход, отрицательное = расход</p>
            </div>
          </template>
          
          <!-- Поля для акций -->
          <template v-else-if="formData.assetType === 'stock'">
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-900 text-sm">Количество акций:</label>
              <input v-model.number="formData.quantity" type="number" class="input-field" placeholder="100">
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-900 text-sm">Стоимость одной акции:</label>
              <input v-model.number="formData.pricePerShare" type="number" class="input-field" placeholder="50">
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="font-semibold text-gray-900 text-sm">Ежемесячный денежный поток:</label>
              <input v-model.number="formData.cashFlow" type="number" class="input-field" placeholder="100 (дивиденды)">
              <p class="text-xs text-gray-500">Обычно положительное значение (дивиденды)</p>
            </div>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div class="text-sm text-blue-800">
                <strong>Общая стоимость:</strong> ${{ (formData.quantity * formData.pricePerShare || 0).toLocaleString() }}
              </div>
            </div>
          </template>
        </div>
        
        <!-- Sell Asset -->
        <div v-else-if="action === 'sell-asset'" class="space-y-4">
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Выберите актив для продажи:</label>
            <select v-model="formData.assetId" class="input-field">
              <option value="">Выберите актив</option>
              <option v-for="asset in player?.assets" :key="asset.id" :value="asset.id">
                {{ asset.name }} - ${{ asset.value.toLocaleString() }}
              </option>
            </select>
          </div>
          
          <div v-if="formData.assetId" class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Цена продажи:</label>
            <input v-model.number="formData.sellPrice" type="number" class="input-field" placeholder="Цена продажи">
          </div>
        </div>
        
        <!-- Take Loan -->
        <div v-else-if="action === 'take-loan'" class="space-y-4">
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Тип кредита:</label>
            <select v-model="formData.loanType" class="input-field">
              <option value="loan">Личный кредит</option>
            </select>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Сумма кредита:</label>
            <input v-model.number="formData.amount" type="number" class="input-field" placeholder="50000">
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Ежемесячный платеж:</label>
            <input v-model.number="formData.monthlyPayment" type="number" class="input-field" placeholder="500">
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Цель кредита (необязательно):</label>
            <input v-model="formData.purpose" type="text" class="input-field" placeholder="Например: Покупка недвижимости">
          </div>
        </div>
        
        <!-- Pay Loan -->
        <div v-else-if="action === 'pay-loan'" class="space-y-4">
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Выберите кредит для погашения:</label>
            <select v-model="formData.liabilityId" class="input-field">
              <option value="">Выберите кредит</option>
              <option v-for="liability in player?.liabilities" :key="liability.id" :value="liability.id">
                {{ liability.name }} - ${{ liability.amount.toLocaleString() }}
              </option>
            </select>
          </div>
          
          <div v-if="formData.liabilityId" class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Сумма погашения:</label>
            <input v-model.number="formData.paymentAmount" type="number" class="input-field" placeholder="Сумма погашения">
          </div>
        </div>
        
        <!-- Request Money -->
        <div v-else-if="action === 'request-money'" class="space-y-4">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span class="font-semibold text-yellow-800">Запрос денег у банка</span>
            </div>
            <p class="text-sm text-yellow-700">
              Вы можете запросить любую сумму денег у банка (ведущему). 
              Запрос будет отправлен на рассмотрение.
            </p>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Сумма запроса:</label>
            <input v-model.number="formData.requestAmount" type="number" class="input-field" placeholder="Введите сумму" min="1">
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Причина запроса (необязательно):</label>
            <input v-model="formData.reason" type="text" class="input-field" placeholder="Например: Для покупки актива">
          </div>
        </div>
        
        <!-- Transfer Money -->
        <div v-else-if="action === 'transfer-money'" class="space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              <span class="font-semibold text-blue-800">Перевод денег игроку</span>
            </div>
            <p class="text-sm text-blue-700">
              Вы можете перевести деньги другому игроку. Запрос будет отправлен ведущему на рассмотрение.
            </p>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Выберите игрока-получателя:</label>
            <select v-model="formData.recipientCode" class="input-field" :disabled="isLoadingPlayers">
              <option value="">Выберите игрока</option>
              <option v-for="playerOption in availablePlayers" :key="playerOption.code" :value="playerOption.code">
                {{ playerOption.name }} ({{ playerOption.code }}) - {{ playerOption.profession }}
              </option>
            </select>
            <div v-if="isLoadingPlayers" class="text-xs text-gray-500">
              Загрузка списка игроков...
            </div>
            <div v-else-if="availablePlayers.length === 0" class="text-xs text-gray-500">
              Нет доступных игроков для перевода
            </div>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Сумма перевода:</label>
            <input v-model.number="formData.transferAmount" type="number" class="input-field" placeholder="Введите сумму" min="1" :max="player?.money || 0">
            <div v-if="player?.money" class="text-xs text-gray-500">
              Доступно: ${{ player.money.toLocaleString() }}
            </div>
          </div>
          
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-900 text-sm">Причина перевода (необязательно):</label>
            <input v-model="formData.transferReason" type="text" class="input-field" placeholder="Например: Возврат долга">
          </div>
        </div>
      </div>
      
      <div class="flex justify-end gap-4 p-6 border-t border-gray-200">
        <button @click="closeModal" class="btn-secondary">Отмена</button>
        <button @click="submitAction" :disabled="!isFormValid" class="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed">
          {{ getSubmitButtonText() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '@/stores/game';
import { useSocket } from '@/composables/useSocket';
import { getPlayersList } from '@/utils/api';
import type { Player } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  action: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const gameStore = useGameStore();
const { emit: socketEmit } = useSocket();

const player = computed(() => gameStore.currentPlayer);
const availablePlayers = ref<Array<{ code: string; name: string; profession: string }>>([]);
const isLoadingPlayers = ref(false);

const formData = ref({
  // Buy Asset
  assetType: 'real-estate',
  name: '',
  value: 0,
  downPayment: 0,
  cashFlow: 0,
  purchaseType: 'down-payment',
  quantity: 0,
  pricePerShare: 0,
  
  // Sell Asset
  assetId: '',
  sellPrice: 0,
  
  // Take Loan
  loanType: 'loan',
  amount: 0,
  monthlyPayment: 0,
  purpose: '',
  
  // Pay Loan
  liabilityId: '',
  paymentAmount: 0,
  
  // Request Money
  requestAmount: 0,
  reason: '',
  
  // Transfer Money
  recipientCode: '',
  transferAmount: 0,
  transferReason: ''
});

const isFormValid = computed(() => {
  switch (props.action) {
    case 'buy-asset':
      if (!formData.value.name) return false;
      
      if (formData.value.assetType === 'real-estate') {
        const basicValidation = formData.value.value > 0 && !isNaN(formData.value.cashFlow);
        if (formData.value.purchaseType === 'down-payment') {
          return basicValidation && formData.value.downPayment > 0;
        } else if (formData.value.purchaseType === 'full-payment') {
          return basicValidation;
        }
        return false;
      } else if (formData.value.assetType === 'business') {
        return formData.value.value > 0 && !isNaN(formData.value.cashFlow);
      } else if (formData.value.assetType === 'stock') {
        return formData.value.quantity > 0 && 
               formData.value.pricePerShare > 0 && 
               !isNaN(formData.value.cashFlow);
      }
      return false;
    case 'sell-asset':
      return formData.value.assetId && formData.value.sellPrice > 0;
    case 'take-loan':
      return formData.value.amount > 0 && formData.value.monthlyPayment > 0;
    case 'pay-loan':
      return formData.value.liabilityId && formData.value.paymentAmount > 0;
    case 'request-money':
      return formData.value.requestAmount > 0;
    case 'transfer-money':
      return formData.value.recipientCode && 
             formData.value.transferAmount > 0 && 
             formData.value.transferAmount <= (player.value?.money || 0);
    default:
      return false;
  }
});

const getActionTitle = () => {
  const titles: Record<string, string> = {
    'buy-asset': 'Покупка актива',
    'sell-asset': 'Продажа актива',
    'take-loan': 'Взятие кредита',
    'pay-loan': 'Погашение кредита',
    'request-money': 'Запрос денег у банка',
    'transfer-money': 'Перевод денег игроку'
  };
  return titles[props.action] || 'Действие';
};

const getSubmitButtonText = () => {
  const texts: Record<string, string> = {
    'buy-asset': 'Купить актив',
    'sell-asset': 'Продать актив',
    'take-loan': 'Взять кредит',
    'pay-loan': 'Погасить кредит',
    'request-money': 'Отправить запрос',
    'transfer-money': 'Отправить заявку на перевод'
  };
  return texts[props.action] || 'Подтвердить';
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const loadPlayersList = async () => {
  if (props.action !== 'transfer-money') return;
  
  isLoadingPlayers.value = true;
  try {
    const response = await getPlayersList();
    // Filter out current player from the list
    availablePlayers.value = response.players.filter(p => p.code !== player.value?.code);
  } catch (error) {
    console.error('Failed to load players list:', error);
    availablePlayers.value = [];
  } finally {
    isLoadingPlayers.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    assetType: 'real-estate',
    name: '',
    value: 0,
    downPayment: 0,
    cashFlow: 0,
    purchaseType: 'down-payment',
    quantity: 0,
    pricePerShare: 0,
    assetId: '',
    sellPrice: 0,
    loanType: 'loan',
    amount: 0,
    monthlyPayment: 0,
    purpose: '',
    liabilityId: '',
    paymentAmount: 0,
    requestAmount: 0,
    reason: '',
    recipientCode: '',
    transferAmount: 0,
    transferReason: ''
  };
};

const submitAction = () => {
  if (!player.value || !isFormValid.value) return;
  
  // Ensure all numeric values are properly converted to numbers
  const details = { ...formData.value };
  if (props.action === 'buy-asset') {
    details.value = Number(details.value);
    details.downPayment = Number(details.downPayment);
    details.cashFlow = Number(details.cashFlow);
    details.quantity = Number(details.quantity);
    details.pricePerShare = Number(details.pricePerShare);
    // purchaseType остается строкой
    
    // Для акций общая стоимость = количество * цена за акцию
    if (details.assetType === 'stock') {
      details.value = details.quantity * details.pricePerShare;
    }
  } else if (props.action === 'sell-asset') {
    details.sellPrice = Number(details.sellPrice);
  } else if (props.action === 'take-loan') {
    details.amount = Number(details.amount);
    details.monthlyPayment = Number(details.monthlyPayment);
  } else if (props.action === 'pay-loan') {
    details.paymentAmount = Number(details.paymentAmount);
  } else if (props.action === 'request-money') {
    details.amount = Number(details.requestAmount);
  } else if (props.action === 'transfer-money') {
    details.amount = Number(details.transferAmount);
    details.recipientCode = details.recipientCode.toUpperCase();
    details.reason = details.transferReason;
  }
  
  const actionData = {
    playerCode: player.value.code,
    action: props.action,
    details: details
  };
  
  console.log('Submitting action:', actionData);
  console.log('Emitting player-action event with data:', actionData);
  
  // Check socket connection before emitting
  const { socket } = useSocket();
  if (!socket?.connected) {
    console.warn('Socket not connected, attempting to connect before emitting action');
    const { connect } = useSocket();
    connect();
  }
  
  socketEmit('player-action', actionData);
  closeModal();
};

// Reset form when modal opens and load players list for transfer
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm();
    if (props.action === 'transfer-money') {
      loadPlayersList();
    }
  }
});
</script>

