<template>
  <div class="card max-w-2xl mx-auto w-full overflow-hidden">
    <div 
      class="text-white p-6 flex flex-col sm:flex-row justify-between items-center gap-4"
      :class="player?.isConnected === false ? 'bg-red-600' : 'bg-green-600'"
    >
      <h2 class="text-xl sm:text-2xl font-semibold m-0">Карточка игрока</h2>
      <div 
        class="px-4 py-2 rounded-full font-semibold text-sm"
        :class="player?.isConnected === false ? 'bg-red-500 bg-opacity-20' : 'bg-white bg-opacity-20'"
      >
        Код: {{ player?.code }}
        <span v-if="player?.isConnected === false" class="ml-2 text-xs opacity-75">
          (Отключен)
        </span>
      </div>
    </div>
    
    <div class="p-6">
      <div class="mb-6 pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-2 m-0">{{ player?.profession.name }}</h3>
        <p class="text-gray-600 text-sm m-0">{{ player?.profession.description }}</p>
      </div>
      
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="text-center">
          <div class="text-xs text-gray-600 mb-1">Деньги</div>
          <div class="text-sm font-semibold text-blue-600">${{ player?.money.toLocaleString() || 0 }}</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-600 mb-1">Доход</div>
          <div class="text-sm font-semibold text-green-600">${{ getTotalIncome(player).toLocaleString() }}</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-600 mb-1">Расходы</div>
          <div class="text-sm font-semibold text-red-600">${{ getTotalExpenses(player).toLocaleString() }}</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-600 mb-1">Дети</div>
          <div class="text-sm font-semibold text-blue-600">{{ player?.children || 0 }}</div>
        </div>
        <div class="text-center">
          <div class="text-xs text-gray-600 mb-1">Денежный поток</div>
          <div class="text-sm font-semibold" :class="cashFlowClass">
            ${{ cashFlow.toLocaleString() }}
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h4 class="text-base font-semibold text-gray-900 mb-4 m-0">Активы</h4>
        
        <!-- Недвижимость -->
        <div v-if="getAssetsByType('real-estate').length" class="mb-4">
          <h5 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Недвижимость
          </h5>
          <div class="space-y-2">
            <div
              v-for="asset in getAssetsByType('real-estate')"
              :key="asset.id"
              class="flex justify-between items-center p-3 bg-blue-50 rounded-md border-l-4 border-blue-500"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ asset.name }}</div>
                <div class="text-xs text-gray-600">
                  Стоимость: ${{ asset.value.toLocaleString() }} | 
                  Взнос: ${{ asset.downPayment?.toLocaleString() || 0 }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-sm" :class="(asset.cashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ (asset.cashFlow || 0) >= 0 ? '+' : '' }}${{ Math.abs(asset.cashFlow || 0).toLocaleString() }}/мес
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Бизнес -->
        <div v-if="getAssetsByType('business').length" class="mb-4">
          <h5 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            Бизнес
          </h5>
          <div class="space-y-2">
            <div
              v-for="asset in getAssetsByType('business')"
              :key="asset.id"
              class="flex justify-between items-center p-3 bg-purple-50 rounded-md border-l-4 border-purple-500"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ asset.name }}</div>
                <div class="text-xs text-gray-600">
                  Стоимость: ${{ asset.value.toLocaleString() }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-sm" :class="(asset.cashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ (asset.cashFlow || 0) >= 0 ? '+' : '' }}${{ Math.abs(asset.cashFlow || 0).toLocaleString() }}/мес
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Акции -->
        <div v-if="getAssetsByType('stock').length" class="mb-4">
          <h5 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            Акции
          </h5>
          <div class="space-y-2">
            <div
              v-for="asset in getAssetsByType('stock')"
              :key="asset.id"
              class="flex justify-between items-center p-3 bg-green-50 rounded-md border-l-4 border-green-500"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ asset.name }}</div>
                <div class="text-xs text-gray-600">
                  {{ asset.quantity?.toLocaleString() || 0 }} акций × ${{ asset.pricePerShare?.toLocaleString() || 0 }} = ${{ asset.value.toLocaleString() }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-sm" :class="(asset.cashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ (asset.cashFlow || 0) >= 0 ? '+' : '' }}${{ Math.abs(asset.cashFlow || 0).toLocaleString() }}/мес
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Если нет активов -->
        <div v-if="!player?.assets.length" class="text-center text-gray-500 italic p-4 bg-gray-50 rounded-md">
          Нет активов
        </div>
      </div>
      
      <div>
        <h4 class="text-base font-semibold text-gray-900 mb-4 m-0">Обязательства</h4>
        <div v-if="player?.liabilities.length" class="space-y-2">
          <div
            v-for="liability in player.liabilities"
            :key="liability.id"
            class="flex justify-between items-center p-3 bg-gray-50 rounded-md border-l-4 border-red-500"
          >
            <div class="font-medium text-gray-900">{{ liability.name }}</div>
            <div class="text-gray-600 text-sm">${{ liability.amount.toLocaleString() }}</div>
            <div class="text-red-600 font-semibold text-sm">-${{ liability.monthlyPayment.toLocaleString() }}/мес</div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 italic p-4 bg-gray-50 rounded-md">
          Нет обязательств
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Player } from '@/types';

const props = defineProps<{
  player: Player | null;
}>();

const getAssetsByType = (type: string) => {
  if (!props.player) return [];
  return props.player.assets.filter(asset => asset.type === type);
};

const getTotalIncome = (player: Player | null) => {
  if (!player) return 0;
  
  const baseIncome = player.income;
  // Add only positive cash flow from assets to income
  const positiveAssetCashFlow = player.assets.reduce((sum, asset) => 
    sum + ((asset.cashFlow || 0) > 0 ? (asset.cashFlow || 0) : 0), 0);
  
  return baseIncome + positiveAssetCashFlow;
};

const getTotalExpenses = (player: Player | null) => {
  if (!player) return 0;
  
  const baseExpenses = player.expenses;
  // Add negative cash flow from assets to expenses (as costs)
  const negativeAssetCashFlow = player.assets.reduce((sum, asset) => 
    sum + ((asset.cashFlow || 0) < 0 ? Math.abs(asset.cashFlow || 0) : 0), 0);
  const liabilityPayments = player.liabilities.reduce((sum, liability) => sum + liability.monthlyPayment, 0);
  const childrenExpenses = getChildrenExpenses(player);
  
  return baseExpenses + negativeAssetCashFlow + liabilityPayments + childrenExpenses;
};

const getChildrenExpenses = (player: Player | null) => {
  if (!player) return 0;
  const childrenCount = player.children || 0;
  const childExpensesPerChild = player.profession?.childExpenses || 640;
  return childrenCount * childExpensesPerChild;
};

const cashFlow = computed(() => {
  if (!props.player) return 0;
  
  // Use the same logic as getTotalIncome and getTotalExpenses to avoid double counting
  return getTotalIncome(props.player) - getTotalExpenses(props.player);
});

const cashFlowClass = computed(() => {
  const flow = cashFlow.value;
  if (flow > 0) return 'text-green-600';
  if (flow < 0) return 'text-red-600';
  return 'text-gray-600';
});
</script>

