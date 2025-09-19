export interface Player {
  id: string;
  code: string;
  name: string;
  profession: Profession;
  money: number;
  assets: Asset[];
  liabilities: Liability[];
  income: number;
  expenses: number;
  children: number; // Количество детей
  isConnected?: boolean;
}

export interface Profession {
  id: string;
  name: string;
  description: string;
  salary: number;
  taxes: number;
  otherExpenses: number;
  childExpenses: number; // Расходы на одного ребенка
  totalExpenses: number;
  cashFlow: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'real-estate' | 'business' | 'stock';
  value: number;
  // Поля для недвижимости
  downPayment?: number; // Первоначальный взнос
  cashFlow?: number; // Ежемесячный денежный поток
  purchaseType?: 'down-payment' | 'full-payment'; // Тип покупки недвижимости
  // Поля для акций
  quantity?: number; // Количество акций
  pricePerShare?: number; // Стоимость одной акции
}

export interface Liability {
  id: string;
  name: string;
  type: 'loan';
  amount: number;
  monthlyPayment: number;
}

export interface GameAction {
  id: string;
  playerCode: string;
  action: 'buy-asset' | 'sell-asset' | 'take-loan' | 'pay-loan' | 'request-money' | 'transfer-money';
  details: any;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}

export interface TransferDetails {
  amount: number;
  recipientCode: string;
  recipientName?: string;
  reason?: string;
}

export interface SocketEvents {
  'join-game': { playerCode: string; playerName: string; profession: Profession };
  'joined-game': { playerCode: string; status: string };
  'admin-join': void;
  'admin-joined': { status: string };
  'player-action': { playerCode: string; action: string; details: any };
  'action-submitted': { status: string };
  'action-request': GameAction;
  'admin-response': { actionId: string; playerCode: string; action: string; approved: boolean; details: any };
  'action-result': { action: string; approved: boolean; details?: any; reason?: string };
  'action-processed': { actionId: string; playerCode: string; action: string; approved: boolean };
  'player-joined': { playerCode: string; playerName: string; profession: Profession; timestamp: Date };
  'player-left': { playerCode: string };
  'player-removed': { playerCode: string; timestamp: Date };
  'current-players': Player[];
  'pending-actions': GameAction[];
  'player-updated': { playerCode: string; player: Player };
  'get-player-data': { playerCode: string };
  'player-data-updated': { player: Player };
  'pending-updates-notification': { message: string };
  'money-received': { amount: number; fromPlayer: string; reason: string };
  'game-reset': { reason: string; timestamp?: Date; message?: string };
}
