<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md">
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'flex items-start gap-3 p-4 rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:-translate-x-1 hover:shadow-xl bg-white border-l-4',
          {
            'border-l-green-500': notification.type === 'success',
            'border-l-red-500': notification.type === 'error',
            'border-l-yellow-500': notification.type === 'warning',
            'border-l-blue-500': notification.type === 'info'
          }
        ]"
        @click="removeNotification(notification.id)"
      >
        <div 
          :class="[
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm text-white',
            {
              'bg-green-500': notification.type === 'success',
              'bg-red-500': notification.type === 'error',
              'bg-yellow-500': notification.type === 'warning',
              'bg-blue-500': notification.type === 'info'
            }
          ]"
        >
          <span v-if="notification.type === 'success'">✓</span>
          <span v-else-if="notification.type === 'error'">✗</span>
          <span v-else-if="notification.type === 'warning'">⚠</span>
          <span v-else>ℹ</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-gray-900 mb-1 text-sm">{{ notification.title }}</div>
          <div v-if="notification.message" class="text-gray-600 text-xs leading-relaxed">
            {{ notification.message }}
          </div>
        </div>
        <button 
          @click.stop="removeNotification(notification.id)" 
          class="flex-shrink-0 bg-transparent border-none text-lg text-gray-400 cursor-pointer p-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors duration-200"
        >
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { useSocket } from '@/composables/useSocket';
import { useNotifications } from '@/composables/useNotifications';

const gameStore = useGameStore();
const { on } = useSocket();
const { notifications, addNotification, removeNotification } = useNotifications();

// Socket event listeners
on('action-result', (data) => {
  if (data.approved) {
    // addNotification({
    //   type: 'success',
    //   title: 'Действие одобрено!',
    //   message: `Ваше действие "${data.action}" было одобрено ведущим.`,
    //   duration: 2000
    // });
  } else {
    addNotification({
      type: 'error',
      title: 'Действие отклонено',
      message: data.reason || 'Ваше действие было отклонено ведущим.',
      duration: 2000
    });
  }
});

on('action-submitted', (data) => {
  addNotification({
    type: 'info',
    title: 'Запрос отправлен',
    message: 'Ваш запрос отправлен ведущему на рассмотрение.',
    duration: 2000
  });
});

on('joined-game', (data) => {
  if (data.status === 'success') {
    addNotification({
      type: 'success',
      title: 'Добро пожаловать в игру!',
      message: `Вы успешно подключились с кодом ${data.playerCode}`,
      duration: 2000
    });
  }
});

// Expose methods for external use
defineExpose({
  addNotification,
  removeNotification
});
</script>

<style scoped>
/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .notification-container {
    @apply top-2.5 left-2.5 right-2.5 max-w-none;
  }
}
</style>
