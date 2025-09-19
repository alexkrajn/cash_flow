<template>
  <div class="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
    <!-- Header with player info and action type -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {{ player?.name ? player.name.charAt(0).toUpperCase() : '?' }}
        </div>
        <div>
          <div class="font-semibold text-gray-900">{{ player?.name || 'Без имени' }}</div>
          <div class="text-sm text-gray-500">{{ action.playerCode }}</div>
        </div>
      </div>
      
      <div class="flex flex-col items-end gap-1">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :class="getActionColor(action.action)"></div>
          <span class="font-semibold text-gray-900">{{ getActionName(action.action) }}</span>
        </div>
        <div class="text-xs text-gray-500">{{ formatTime(action.timestamp) }}</div>
      </div>
    </div>

    <!-- Player financial overview -->
    <div class="bg-gray-50 rounded-lg p-4 mb-4">
      <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
        </svg>
        Финансовое состояние игрока
      </h4>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div class="text-center">
          <div class="text-gray-500">Деньги</div>
          <div class="font-semibold text-blue-600">${{ (player?.money || 0).toLocaleString() }}</div>
        </div>
        <div class="text-center">
          <div class="text-gray-500">Доходы</div>
          <div class="font-semibold text-green-600">${{ getTotalIncome(player || null).toLocaleString() }}</div>
        </div>
        <div class="text-center">
          <div class="text-gray-500">Расходы</div>
          <div class="font-semibold text-red-600">${{ getTotalExpenses(player || null).toLocaleString() }}</div>
        </div>
        <div class="text-center">
          <div class="text-gray-500">Денежный поток</div>
          <div class="font-semibold" :class="getCashFlowClass(player || null)">
            ${{ getCashFlow(player || null).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Action details -->
    <div class="mb-4">
      <h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        Детали запроса
      </h4>
      
      <!-- Buy Asset -->
      <div v-if="action.action === 'buy-asset'" class="bg-blue-50 rounded-lg p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-600">Тип актива</div>
            <div class="font-semibold text-gray-900">{{ getAssetTypeName(action.details.assetType) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Название</div>
            <div class="font-semibold text-gray-900">{{ action.details.name }}</div>
          </div>
          
          <!-- Поля для недвижимости -->
          <template v-if="action.details.assetType === 'real-estate'">
            <div>
              <div class="text-sm text-gray-600">Стоимость актива</div>
              <div class="font-semibold text-gray-900">${{ action.details.value.toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Первоначальный взнос</div>
              <div class="font-semibold text-gray-900">${{ action.details.downPayment.toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Ежемесячный денежный поток</div>
              <div class="font-semibold" :class="action.details.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ action.details.cashFlow >= 0 ? '+' : '' }}${{ Math.abs(action.details.cashFlow).toLocaleString() }}/мес
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Первоначальный взнос (списание)</div>
              <div class="font-semibold text-red-600">-${{ action.details.downPayment.toLocaleString() }}</div>
            </div>
          </template>
          
          <!-- Поля для бизнеса -->
          <template v-else-if="action.details.assetType === 'business'">
            <div>
              <div class="text-sm text-gray-600">Стоимость актива</div>
              <div class="font-semibold text-gray-900">${{ action.details.value.toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Ежемесячный денежный поток</div>
              <div class="font-semibold" :class="action.details.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ action.details.cashFlow >= 0 ? '+' : '' }}${{ Math.abs(action.details.cashFlow).toLocaleString() }}/мес
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Списание с баланса</div>
              <div class="font-semibold text-red-600">-${{ action.details.value.toLocaleString() }}</div>
            </div>
          </template>
          
          <!-- Поля для акций -->
          <template v-else-if="action.details.assetType === 'stock'">
            <div>
              <div class="text-sm text-gray-600">Количество акций</div>
              <div class="font-semibold text-gray-900">{{ action.details.quantity.toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Стоимость одной акции</div>
              <div class="font-semibold text-gray-900">${{ action.details.pricePerShare.toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Общая стоимость</div>
              <div class="font-semibold text-gray-900">${{ action.details.value.toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Ежемесячный денежный поток</div>
              <div class="font-semibold" :class="action.details.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ action.details.cashFlow >= 0 ? '+' : '' }}${{ Math.abs(action.details.cashFlow).toLocaleString() }}/мес
              </div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Списание с баланса</div>
              <div class="font-semibold text-red-600">-${{ action.details.value.toLocaleString() }}</div>
            </div>
          </template>
        </div>
      </div>

      <!-- Sell Asset -->
      <div v-else-if="action.action === 'sell-asset'" class="bg-green-50 rounded-lg p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-600">Продаваемый актив</div>
            <div class="font-semibold text-gray-900">{{ getAssetName(action.details.assetId) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Цена продажи</div>
            <div class="font-semibold text-green-600">+${{ action.details.sellPrice.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Take Loan -->
      <div v-else-if="action.action === 'take-loan'" class="bg-yellow-50 rounded-lg p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-600">Тип кредита</div>
            <div class="font-semibold text-gray-900">{{ getLoanTypeName(action.details.loanType) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Цель</div>
            <div class="font-semibold text-gray-900">{{ action.details.purpose }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Сумма кредита</div>
            <div class="font-semibold text-green-600">+${{ action.details.amount.toLocaleString() }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Ежемесячный платеж</div>
            <div class="font-semibold text-red-600">-${{ action.details.monthlyPayment.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Pay Loan -->
      <div v-else-if="action.action === 'pay-loan'" class="bg-purple-50 rounded-lg p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-600">Погашаемый кредит</div>
            <div class="font-semibold text-gray-900">{{ getLiabilityName(action.details.liabilityId) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Сумма погашения</div>
            <div class="font-semibold text-red-600">-${{ action.details.paymentAmount.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- Request Money -->
      <div v-else-if="action.action === 'request-money'" class="bg-orange-50 rounded-lg p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-600">Запрашиваемая сумма</div>
            <div class="font-semibold text-green-600 text-lg">+${{ action.details.amount.toLocaleString() }}</div>
          </div>
          <div v-if="action.details.reason">
            <div class="text-sm text-gray-600">Причина запроса</div>
            <div class="font-semibold text-gray-900">{{ action.details.reason }}</div>
          </div>
        </div>
        <div class="mt-3 p-3 bg-yellow-100 rounded-lg border border-yellow-200">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span class="text-sm font-medium text-yellow-800">Запрос денег у банка</span>
          </div>
          <p class="text-xs text-yellow-700 mt-1">
            Игрок запрашивает деньги у банка. При одобрении сумма будет добавлена к балансу игрока.
          </p>
        </div>
      </div>

      <!-- Transfer Money -->
      <div v-else-if="action.action === 'transfer-money'" class="bg-purple-50 rounded-lg p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-600">Получатель</div>
            <div class="font-semibold text-gray-900">{{ action.details.recipientCode }}</div>
            <div class="text-xs text-gray-500">{{ getRecipientName(action.details.recipientCode) }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Сумма перевода</div>
            <div class="font-semibold text-red-600 text-lg">-${{ action.details.amount.toLocaleString() }}</div>
          </div>
          <div v-if="action.details.reason" class="sm:col-span-2">
            <div class="text-sm text-gray-600">Причина перевода</div>
            <div class="font-semibold text-gray-900">{{ action.details.reason }}</div>
          </div>
        </div>
        <div class="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
            <span class="text-sm font-medium text-blue-800">Перевод денег игроку</span>
          </div>
          <p class="text-xs text-blue-700 mt-1">
            Игрок хочет перевести деньги другому игроку. При одобрении сумма будет списана с отправителя и добавлена получателю.
          </p>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex flex-col sm:flex-row gap-3">
      <button
        @click="$emit('approve', action)"
        class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Одобрить
      </button>
      <button
        @click="$emit('reject', action)"
        class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        Отклонить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GameAction, Player } from '@/types';

const props = defineProps<{
  action: GameAction;
  player?: Player;
  allPlayers?: Player[];
}>();

const emit = defineEmits<{
  approve: [action: GameAction];
  reject: [action: GameAction];
}>();

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

const getActionColor = (action: string) => {
  const colors: Record<string, string> = {
    'buy-asset': 'bg-blue-500',
    'sell-asset': 'bg-green-500',
    'take-loan': 'bg-yellow-500',
    'pay-loan': 'bg-purple-500',
    'request-money': 'bg-orange-500',
    'transfer-money': 'bg-purple-500'
  };
  return colors[action] || 'bg-gray-500';
};

const formatTime = (timestamp: Date) => {
  return new Date(timestamp).toLocaleTimeString();
};

const getTotalIncome = (player: Player | null) => {
  if (!player) return 0;
  
  const baseIncome = player.income;
  // Add only positive cash flow from assets to income
  const positiveAssetCashFlow = player.assets.reduce((sum, asset) => 
    sum + (asset.cashFlow && asset.cashFlow > 0 ? asset.cashFlow : 0), 0);
  
  return baseIncome + positiveAssetCashFlow;
};

const getTotalExpenses = (player: Player | null) => {
  if (!player) return 0;
  
  const baseExpenses = player.expenses;
  // Add negative cash flow from assets to expenses (as costs)
  const negativeAssetCashFlow = player.assets.reduce((sum, asset) => 
    sum + (asset.cashFlow && asset.cashFlow < 0 ? Math.abs(asset.cashFlow) : 0), 0);
  const liabilityPayments = player.liabilities.reduce((sum, liability) => sum + liability.monthlyPayment, 0);
  
  return baseExpenses + negativeAssetCashFlow + liabilityPayments;
};

const getCashFlow = (player: Player | null) => {
  if (!player) return 0;
  
  // Use the same logic as getTotalIncome and getTotalExpenses to avoid double counting
  return getTotalIncome(player) - getTotalExpenses(player);
};

const getCashFlowClass = (player: Player | null) => {
  const flow = getCashFlow(player);
  if (flow > 0) return 'text-green-600';
  if (flow < 0) return 'text-red-600';
  return 'text-gray-600';
};

const getAssetTypeName = (type: string) => {
  const types: Record<string, string> = {
    'real-estate': 'Недвижимость',
    'business': 'Бизнес',
    'stock': 'Акции'
  };
  return types[type] || type;
};

const getLoanTypeName = (type: string) => {
  const types: Record<string, string> = {
    'loan': 'Личный кредит'
  };
  return types[type] || type;
};

const getAssetName = (assetId: string) => {
  const asset = props.player?.assets.find(a => a.id === assetId);
  return asset ? `${asset.name} - $${asset.value.toLocaleString()}` : 'Неизвестный актив';
};

const getLiabilityName = (liabilityId: string) => {
  const liability = props.player?.liabilities.find(l => l.id === liabilityId);
  return liability ? `${liability.name} - $${liability.amount.toLocaleString()}` : 'Неизвестный кредит';
};

const getRecipientName = (recipientCode: string) => {
  const recipient = props.allPlayers?.find(p => p.code === recipientCode);
  return recipient ? recipient.name : 'Неизвестный игрок';
};
</script>
