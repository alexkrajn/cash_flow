import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Player, Profession, GameAction } from '@/types';

// Local storage keys
const PLAYER_CODE_KEY = 'cash_flow_player_code';
const PLAYER_NAME_KEY = 'cash_flow_player_name';
const PLAYER_PROFESSION_KEY = 'cash_flow_player_profession';

export const useGameStore = defineStore('game', () => {
  // State
  const currentPlayer = ref<Player | null>(null);
  const playerCode = ref<string>('');
  const selectedProfession = ref<Profession | null>(null);
  const isAdmin = ref(false);
  const players = ref<Player[]>([]);
  const pendingActions = ref<GameAction[]>([]);

  // Getters
  const isPlayerJoined = computed(() => !!currentPlayer.value);
  const playerCount = computed(() => players.value.length);
  const pendingActionsCount = computed(() => pendingActions.value.length);

  // Local storage functions
  const savePlayerData = (code: string, name: string, profession: Profession) => {
    localStorage.setItem(PLAYER_CODE_KEY, code);
    localStorage.setItem(PLAYER_NAME_KEY, name);
    localStorage.setItem(PLAYER_PROFESSION_KEY, JSON.stringify(profession));
  };

  const loadPlayerData = () => {
    const code = localStorage.getItem(PLAYER_CODE_KEY);
    const name = localStorage.getItem(PLAYER_NAME_KEY);
    const professionStr = localStorage.getItem(PLAYER_PROFESSION_KEY);
    
    if (code && name && professionStr) {
      try {
        const profession = JSON.parse(professionStr);
        return { code, name, profession };
      } catch (error) {
        console.error('Error parsing stored profession:', error);
        clearPlayerData();
        return null;
      }
    }
    return null;
  };

  const clearPlayerData = () => {
    localStorage.removeItem(PLAYER_CODE_KEY);
    localStorage.removeItem(PLAYER_NAME_KEY);
    localStorage.removeItem(PLAYER_PROFESSION_KEY);
  };

  // Actions
  const setPlayerCode = (code: string) => {
    playerCode.value = code;
  };

  const setSelectedProfession = (profession: Profession | null) => {
    selectedProfession.value = profession;
  };

  const joinGame = (player: Player) => {
    console.log('Store: joinGame called with player:', player);
    currentPlayer.value = player;
    console.log('Store: currentPlayer updated to:', currentPlayer.value);
    
    // Save player data to localStorage
    if (player.name && selectedProfession.value) {
      savePlayerData(player.code, player.name, selectedProfession.value);
    }
  };

  const leaveGame = () => {
    currentPlayer.value = null;
    playerCode.value = '';
    selectedProfession.value = null;
    isAdmin.value = false;
    // Don't clear localStorage here - we want to keep data for reconnection
  };

  const clearGameData = () => {
    currentPlayer.value = null;
    playerCode.value = '';
    selectedProfession.value = null;
    isAdmin.value = false;
    clearPlayerData();
  };

  const setAdminMode = (admin: boolean) => {
    isAdmin.value = admin;
  };

  const updatePlayers = (newPlayers: Player[]) => {
    players.value = newPlayers;
  };

  const addPlayer = (player: Player) => {
    const existingIndex = players.value.findIndex(p => p.code === player.code);
    if (existingIndex >= 0) {
      console.log('Updating existing player:', player.code);
      players.value[existingIndex] = player;
    } else {
      console.log('Adding new player:', player.code);
      players.value.push(player);
    }
  };

  const removePlayer = (playerCode: string) => {
    players.value = players.value.filter(p => p.code !== playerCode);
  };

  const addPendingAction = (action: GameAction) => {
    console.log('Adding pending action:', action);
    // Check if action already exists to prevent duplication
    const existingAction = pendingActions.value.find(a => a.id === action.id);
    if (!existingAction) {
      pendingActions.value.push(action);
      console.log('Action added successfully. Total pending actions:', pendingActions.value.length);
    } else {
      console.log('Action already exists, skipping:', action.id);
    }
  };

  const removePendingAction = (actionId: string) => {
    console.log('Removing pending action with ID:', actionId);
    console.log('Current pending actions:', pendingActions.value.map(a => ({ id: a.id, action: a.action })));
    pendingActions.value = pendingActions.value.filter(a => a.id !== actionId);
    console.log('Pending actions after removal:', pendingActions.value.map(a => ({ id: a.id, action: a.action })));
  };

  const updatePlayerMoney = (amount: number) => {
    if (currentPlayer.value) {
      currentPlayer.value.money += amount;
    }
  };

  const addAsset = (asset: any) => {
    if (currentPlayer.value) {
      currentPlayer.value.assets.push(asset);
    }
  };

  const removeAsset = (assetId: string) => {
    if (currentPlayer.value) {
      currentPlayer.value.assets = currentPlayer.value.assets.filter(
        a => a.id !== assetId
      );
    }
  };

  const addLiability = (liability: any) => {
    if (currentPlayer.value) {
      currentPlayer.value.liabilities.push(liability);
    }
  };

  const removeLiability = (liabilityId: string) => {
    if (currentPlayer.value) {
      currentPlayer.value.liabilities = currentPlayer.value.liabilities.filter(
        l => l.id !== liabilityId
      );
    }
  };

  return {
    // State
    currentPlayer,
    playerCode,
    selectedProfession,
    isAdmin,
    players,
    pendingActions,
    
    // Getters
    isPlayerJoined,
    playerCount,
    pendingActionsCount,
    
    // Actions
    setPlayerCode,
    setSelectedProfession,
    joinGame,
    leaveGame,
    clearGameData,
    setAdminMode,
    updatePlayers,
    addPlayer,
    removePlayer,
    addPendingAction,
    removePendingAction,
    updatePlayerMoney,
    addAsset,
    removeAsset,
    addLiability,
    removeLiability,
    
    // Local storage functions
    savePlayerData,
    loadPlayerData,
    clearPlayerData,
  };
});
