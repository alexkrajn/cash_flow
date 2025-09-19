<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeModal">
    <div class="bg-white rounded-xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl m-4 sm:m-8" @click.stop>
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900 m-0">Редактирование игрока: {{ player?.code }}</h3>
        <button @click="closeModal" class="bg-transparent border-none text-2xl cursor-pointer text-gray-600 p-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200">
          &times;
        </button>
      </div>
      
      <div class="p-6">
        <div v-if="player" class="space-y-8">
          <!-- Basic Info -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 m-0">Основная информация</h4>
            <div class="space-y-4">
              <div class="flex flex-col gap-2">
                <label class="font-semibold text-gray-900 text-sm">Деньги:</label>
                <input v-model.number="editData!.money" type="number" class="input-field">
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-semibold text-gray-900 text-sm">Доход:</label>
                <input v-model.number="editData!.income" type="number" class="input-field">
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-semibold text-gray-900 text-sm">Расходы:</label>
                <input v-model.number="editData!.expenses" type="number" class="input-field">
              </div>
            </div>
          </div>
          
          <!-- Assets -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 m-0">Активы</h4>
            <div v-for="(asset, index) in editData!.assets" :key="asset.id" class="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-gray-900">{{ asset.name }}</span>
                <button @click="removeAsset(index)" class="bg-red-600 hover:bg-red-700 text-white border-none rounded-full w-6 h-6 cursor-pointer text-sm flex items-center justify-center transition-colors duration-200">
                  ×
                </button>
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                <input v-model.number="asset.value" type="number" placeholder="Стоимость" class="input-field text-sm py-2">
                <input v-model.number="asset.cashFlow" type="number" placeholder="Денежный поток" class="input-field text-sm py-2">
              </div>
            </div>
            <button @click="addAsset" class="bg-green-600 hover:bg-green-700 text-white border-none py-2 px-4 rounded cursor-pointer text-sm transition-colors duration-200">
              + Добавить актив
            </button>
          </div>
          
          <!-- Liabilities -->
          <div>
            <h4 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200 m-0">Обязательства</h4>
            <div v-for="(liability, index) in editData!.liabilities" :key="liability.id" class="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-gray-900">{{ liability.name }}</span>
                <button @click="removeLiability(index)" class="bg-red-600 hover:bg-red-700 text-white border-none rounded-full w-6 h-6 cursor-pointer text-sm flex items-center justify-center transition-colors duration-200">
                  ×
                </button>
              </div>
              <div class="flex flex-col sm:flex-row gap-2">
                <input v-model.number="liability.amount" type="number" placeholder="Сумма" class="input-field text-sm py-2">
                <input v-model.number="liability.monthlyPayment" type="number" placeholder="Ежемесячный платеж" class="input-field text-sm py-2">
              </div>
            </div>
            <button @click="addLiability" class="bg-green-600 hover:bg-green-700 text-white border-none py-2 px-4 rounded cursor-pointer text-sm transition-colors duration-200">
              + Добавить обязательство
            </button>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end gap-4 p-6 border-t border-gray-200">
        <button @click="closeModal" class="btn-secondary">Отмена</button>
        <button @click="saveChanges" class="btn-primary">Сохранить изменения</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSocket } from '@/composables/useSocket';
import type { Player, Asset, Liability } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  player: Player | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [player: Player];
}>();

const { emit: socketEmit } = useSocket();

const editData = ref<Player | null>(null);

const closeModal = () => {
  emit('close');
};

const saveChanges = () => {
  if (editData.value) {
    console.log('Saving changes from PlayerEditModal:', {
      code: editData.value.code,
      money: editData.value.money,
      income: editData.value.income,
      expenses: editData.value.expenses,
      assets: editData.value.assets,
      liabilities: editData.value.liabilities
    });
    emit('save', editData.value);
    closeModal();
  }
};

const addAsset = () => {
  if (editData.value) {
    const newAsset: Asset = {
      id: generateId(),
      name: 'Новый актив',
      type: 'real-estate',
      value: 0,
      downPayment: 0,
      cashFlow: 0
    };
    editData.value.assets.push(newAsset);
  }
};

const removeAsset = (index: number) => {
  if (editData.value) {
    editData.value.assets.splice(index, 1);
  }
};

const addLiability = () => {
  if (editData.value) {
    const newLiability: Liability = {
      id: generateId(),
      name: 'Новое обязательство',
      type: 'loan',
      amount: 0,
      monthlyPayment: 0
    };
    editData.value.liabilities.push(newLiability);
  }
};

const removeLiability = (index: number) => {
  if (editData.value) {
    editData.value.liabilities.splice(index, 1);
  }
};

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Watch for player changes and create a deep copy for editing
watch(() => props.player, (newPlayer) => {
  if (newPlayer) {
    editData.value = JSON.parse(JSON.stringify(newPlayer));
  }
}, { immediate: true });
</script>

