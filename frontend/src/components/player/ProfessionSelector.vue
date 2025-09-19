<template>
  <div class="max-w-6xl mx-auto py-8 px-4">
    <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">Выберите профессию</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div
        v-for="profession in professions"
        :key="profession.id"
        class="card cursor-pointer transition-all duration-300 hover:border-green-500 hover:-translate-y-1 hover:shadow-lg active:scale-95 touch-manipulation"
        :class="{ 'border-green-500 bg-green-50': selectedProfession?.id === profession.id }"
        @click="selectProfession(profession)"
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ profession.name }}</h3>
        <p class="text-gray-600 text-sm mb-4">{{ profession.description }}</p>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-medium text-gray-700">Зарплата:</span>
            <span class="font-semibold text-gray-900">${{ profession.salary.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-medium text-gray-700">Расходы:</span>
            <span class="font-semibold text-gray-900">${{ profession.otherExpenses.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-medium text-gray-700">На одного ребенка:</span>
            <span class="font-semibold text-gray-900">${{ profession.childExpenses.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-medium text-gray-700">Денежный поток:</span>
            <span class="font-semibold text-green-600">${{ profession.cashFlow.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="selectedProfession" class="card max-w-md mx-auto text-center bg-green-50">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Выбранная профессия: {{ selectedProfession.name }}</h3>
      <button 
        @click="confirmSelection" 
        class="btn-primary w-full min-h-12 text-lg font-semibold active:scale-95 touch-manipulation"
      >
        Подтвердить выбор
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { professions } from '@/utils/professions';
import type { Profession } from '@/types';

const emit = defineEmits<{
  professionSelected: [profession: Profession];
}>();

const selectedProfession = ref<Profession | null>(null);

const selectProfession = (profession: Profession) => {
  selectedProfession.value = profession;
};

const confirmSelection = () => {
  if (selectedProfession.value) {
    emit('professionSelected', selectedProfession.value);
  }
};
</script>

