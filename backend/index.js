const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// In-memory storage for game sessions
const gameSessions = new Map();
const players = new Map();
const pendingActions = new Map(); // Store pending action requests

// Clean up old players without names (for development)
function cleanupOldPlayers() {
  for (const [code, player] of players.entries()) {
    if (!player.name) {
      console.log('Removing old player without name:', code);
      players.delete(code);
    }
  }
}

// Clean up disconnected players after timeout
function cleanupDisconnectedPlayers() {
  const now = Date.now();
  const DISCONNECT_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  for (const [code, player] of players.entries()) {
    if (!player.connected && player.lastDisconnected) {
      const timeSinceDisconnect = now - player.lastDisconnected;
      if (timeSinceDisconnect > DISCONNECT_TIMEOUT) {
        console.log('Removing old disconnected player:', code);
        players.delete(code);
      }
    }
  }
}

// Clean up old pending actions
function cleanupOldPendingActions() {
  const now = Date.now();
  const ACTION_TIMEOUT = 60 * 60 * 1000; // 1 hour
  
  for (const [actionId, action] of pendingActions.entries()) {
    const timeSinceAction = now - new Date(action.timestamp).getTime();
    if (timeSinceAction > ACTION_TIMEOUT) {
      console.log('Removing old pending action:', actionId);
      pendingActions.delete(actionId);
    }
  }
}

// Clean up old players on startup
cleanupOldPlayers();

// Set up periodic cleanup of disconnected players and old actions
setInterval(cleanupDisconnectedPlayers, 5 * 60 * 1000); // Every 5 minutes
setInterval(cleanupOldPendingActions, 10 * 60 * 1000); // Every 10 minutes

// Game logic functions
function recalculatePlayerFinances(player) {
  // Recalculate base income and expenses (only from profession)
  // Asset cash flow and liability payments are calculated separately in cash flow formula
  const baseIncome = player.profession ? (player.profession.salary || 0) : 0;
  const baseExpenses = player.profession ? (player.profession.totalExpenses || 0) : 0;
  
  const assetCashFlow = player.assets.reduce((sum, asset) => {
    // Only add cash flow if it exists (for real estate and stocks)
    return sum + (asset.cashFlow || 0);
  }, 0);
  const liabilityPayments = player.liabilities.reduce((sum, liability) => sum + (liability.monthlyPayment || 0), 0);
  
  // Calculate children expenses
  const childrenCount = player.children || 0;
  const childExpensesPerChild = player.profession ? (player.profession.childExpenses || 640) : 640;
  const childrenExpenses = childrenCount * childExpensesPerChild;
  
  // Store only base income and expenses, not including assets/liabilities/children
  player.income = baseIncome;
  player.expenses = baseExpenses;
  
  console.log('Recalculated player finances:', {
    baseIncome,
    baseExpenses,
    assetCashFlow,
    liabilityPayments,
    childrenExpenses,
    childrenCount,
    totalIncome: player.income,
    totalExpenses: player.expenses,
    netCashFlow: baseIncome - baseExpenses + assetCashFlow - liabilityPayments - childrenExpenses
  });
}

function processApprovedAction(player, action, details) {
  console.log('Processing approved action:', { action, details, playerCode: player.code });
  
  switch (action) {
    case 'buy-asset':
      const assetType = details.assetType;
      let newAsset = {
        id: generateId(),
        name: details.name,
        type: assetType,
        value: Number(details.value)
      };
      
      // Validate and set fields based on asset type
      if (assetType === 'real-estate') {
        // Validate cash flow
        const cashFlow = Number(details.cashFlow);
        if (isNaN(cashFlow)) {
          console.error('Invalid cash flow:', details.cashFlow);
          return;
        }
        
        newAsset.cashFlow = cashFlow;
        newAsset.purchaseType = details.purchaseType || 'down-payment';
        
        // Handle different purchase types
        if (details.purchaseType === 'full-payment') {
          // Full payment - player pays the entire value
          newAsset.downPayment = newAsset.value; // Store full value as downPayment for consistency
          console.log('Adding real estate asset (full payment):', newAsset);
          player.assets.push(newAsset);
          player.money -= newAsset.value;
        } else {
          // Down payment - validate down payment amount
          const downPayment = Number(details.downPayment);
          if (isNaN(downPayment) || downPayment <= 0) {
            console.error('Invalid down payment:', details.downPayment);
            return;
          }
          
          newAsset.downPayment = downPayment;
          console.log('Adding real estate asset (down payment):', newAsset);
          player.assets.push(newAsset);
          player.money -= downPayment;
        }
        
      } else if (assetType === 'business') {
        // Validate cash flow
        const cashFlow = Number(details.cashFlow);
        if (isNaN(cashFlow)) {
          console.error('Invalid cash flow:', details.cashFlow);
          return;
        }
        
        newAsset.cashFlow = cashFlow;
        
        console.log('Adding business asset:', newAsset);
        player.assets.push(newAsset);
        player.money -= newAsset.value;
        
      } else if (assetType === 'stock') {
        // Validate quantity and price per share
        const quantity = Number(details.quantity);
        const pricePerShare = Number(details.pricePerShare);
        const cashFlow = Number(details.cashFlow);
        
        if (isNaN(quantity) || quantity <= 0) {
          console.error('Invalid quantity:', details.quantity);
          return;
        }
        
        if (isNaN(pricePerShare) || pricePerShare <= 0) {
          console.error('Invalid price per share:', details.pricePerShare);
          return;
        }
        
        if (isNaN(cashFlow)) {
          console.error('Invalid cash flow:', details.cashFlow);
          return;
        }
        
        newAsset.quantity = quantity;
        newAsset.pricePerShare = pricePerShare;
        newAsset.cashFlow = cashFlow;
        
        console.log('Adding stock asset:', newAsset);
        player.assets.push(newAsset);
        player.money -= newAsset.value; // value is already calculated as quantity * pricePerShare
        
      } else {
        console.error('Invalid asset type:', assetType);
        return;
      }
      
      console.log('Player money after purchase:', player.money);
      console.log('Player assets after adding:', player.assets);
      break;
      
    case 'sell-asset':
      // Remove asset and add money
      const assetIndex = player.assets.findIndex(a => a.id === details.assetId);
      if (assetIndex > -1) {
        const asset = player.assets[assetIndex];
        player.assets.splice(assetIndex, 1);
        player.money += details.sellPrice;
      }
      break;
      
    case 'take-loan':
      // Add liability and money
      const newLiability = {
        id: generateId(),
        name: `${details.loanType} - ${details.purpose}`,
        type: details.loanType,
        amount: details.amount,
        monthlyPayment: details.monthlyPayment
      };
      player.liabilities.push(newLiability);
      player.money += details.amount;
      break;
      
    case 'pay-loan':
      // Reduce liability and money
      const liabilityIndex = player.liabilities.findIndex(l => l.id === details.liabilityId);
      if (liabilityIndex > -1) {
        const liability = player.liabilities[liabilityIndex];
        const paymentAmount = Math.min(details.paymentAmount, liability.amount);
        liability.amount -= paymentAmount;
        player.money -= paymentAmount;
        
        // Remove liability if fully paid
        if (liability.amount <= 0) {
          player.liabilities.splice(liabilityIndex, 1);
        }
      }
      break;
      
    case 'request-money':
      // Add money to player (bank loan)
      const requestedAmount = Number(details.amount);
      if (isNaN(requestedAmount) || requestedAmount <= 0) {
        console.error('Invalid money request amount:', details.amount);
        // Don't return here - let the action be processed as rejected
        break;
      }
      
      player.money += requestedAmount;
      console.log('Added money to player:', {
        playerCode: player.code,
        amount: requestedAmount,
        newBalance: player.money
      });
      break;
      
    case 'transfer-money':
      // Transfer money between players
      const transferAmount = Number(details.amount);
      const recipientCode = details.recipientCode;
      
      if (isNaN(transferAmount) || transferAmount <= 0) {
        console.error('Invalid transfer amount:', details.amount);
        break;
      }
      
      if (!recipientCode) {
        console.error('Missing recipient code for transfer');
        break;
      }
      
      // Check if sender has enough money
      if (player.money < transferAmount) {
        console.error('Insufficient funds for transfer:', {
          playerCode: player.code,
          currentMoney: player.money,
          transferAmount: transferAmount
        });
        break;
      }
      
      // Find recipient player
      const recipient = players.get(recipientCode);
      if (!recipient) {
        console.error('Recipient player not found:', recipientCode);
        break;
      }
      
      // Perform the transfer
      player.money -= transferAmount;
      recipient.money += transferAmount;
      
      // Update recipient in storage
      players.set(recipientCode, recipient);
      
      console.log('Money transfer completed:', {
        fromPlayer: player.code,
        toPlayer: recipientCode,
        amount: transferAmount,
        senderNewBalance: player.money,
        recipientNewBalance: recipient.money
      });
      break;
  }
  
  // Recalculate player finances after any action
  recalculatePlayerFinances(player);
  
  // Update player in storage
  players.set(player.code, player);
}

function generateId() {
  const id = Math.random().toString(36).substr(2, 9);
  console.log('Generated ID:', id);
  return id;
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Cash Flow Backend is running' });
});

// Generate unique player code
app.post('/api/player/generate-code', (req, res) => {
  const playerCode = uuidv4().substring(0, 8).toUpperCase();
  res.json({ playerCode });
});

// Update player data (admin only)
app.put('/api/player/:playerCode', (req, res) => {
  const { playerCode } = req.params;
  const updatedPlayer = req.body;
  
  console.log('Admin updating player:', playerCode, 'with data:', {
    money: updatedPlayer.money,
    income: updatedPlayer.income,
    expenses: updatedPlayer.expenses,
    assetsCount: updatedPlayer.assets?.length || 0,
    liabilitiesCount: updatedPlayer.liabilities?.length || 0
  });
  
  const player = players.get(playerCode);
  if (player) {
    // Update player data
    Object.assign(player, updatedPlayer);
    
    // Recalculate player finances after admin update
    recalculatePlayerFinances(player);
    
    players.set(playerCode, player);
    
    console.log('Player updated successfully:', {
      playerCode,
      money: player.money,
      income: player.income,
      expenses: player.expenses,
      assetsCount: player.assets.length,
      liabilitiesCount: player.liabilities.length
    });
    
    // Notify admin about the update
    io.to('admin-room').emit('player-updated', { playerCode, player });
    
    // Notify the specific player about the update
    if (player.id) {
      const playerSocket = io.sockets.sockets.get(player.id);
      if (playerSocket) {
        playerSocket.emit('player-data-updated', { player });
        console.log('Sent player-data-updated to player:', playerCode, 'socket:', player.id);
      } else {
        console.log('Player socket not found for update:', playerCode, 'socket ID:', player.id);
        // Mark that player has pending updates when they reconnect
        player.hasPendingUpdates = true;
        console.log('Marked player as having pending updates for reconnection:', playerCode);
      }
    } else {
      console.log('Player has no socket ID:', playerCode);
      // Mark that player has pending updates when they reconnect
      player.hasPendingUpdates = true;
      console.log('Marked player as having pending updates for reconnection:', playerCode);
    }
    
    res.json({ success: true, player });
  } else {
    console.log('Player not found for update:', playerCode);
    res.status(404).json({ error: 'Player not found' });
  }
});

// Get all players (admin only)
app.get('/api/players', (req, res) => {
  const playersList = Array.from(players.values());
  res.json({ players: playersList });
});

// Get players list for transfer (public endpoint for players)
app.get('/api/players/list', (req, res) => {
  const playersList = Array.from(players.values())
    .filter(player => player.name && player.connected) // Only connected players with names
    .map(player => ({
      code: player.code,
      name: player.name,
      profession: player.profession?.name || 'Без профессии'
    }));
  res.json({ players: playersList });
});

// Delete player (admin only)
app.delete('/api/player/:playerCode', (req, res) => {
  const { playerCode } = req.params;
  
  const player = players.get(playerCode);
  if (player) {
    // Disconnect player if connected
    if (player.connected && player.id) {
      const playerSocket = io.sockets.sockets.get(player.id);
      if (playerSocket) {
        playerSocket.emit('player-removed', { 
          reason: 'Удален ведущим' 
        });
        playerSocket.disconnect();
      }
    }
    
    // Remove player from storage
    players.delete(playerCode);
    
    // Notify admin about player removal
    io.to('admin-room').emit('player-removed', { 
      playerCode,
      timestamp: new Date()
    });
    
    res.json({ success: true, message: 'Player removed successfully' });
  } else {
    res.status(404).json({ error: 'Player not found' });
  }
});

// Clear all game data (admin only)
app.post('/api/admin/clear-all-data', (req, res) => {
  console.log('Admin requested to clear all game data');
  
  try {
    // Disconnect all players
    for (const [code, player] of players.entries()) {
      if (player.connected && player.id) {
        const playerSocket = io.sockets.sockets.get(player.id);
        if (playerSocket) {
          playerSocket.emit('game-reset', { 
            reason: 'Игра сброшена ведущим. Все данные очищены.' 
          });
          playerSocket.disconnect();
        }
      }
    }
    
    // Clear all data
    players.clear();
    pendingActions.clear();
    gameSessions.clear();
    
    console.log('All game data cleared successfully');
    
    // Notify admin about successful reset
    io.to('admin-room').emit('game-reset', { 
      timestamp: new Date(),
      message: 'Все данные игры успешно очищены'
    });
    
    res.json({ 
      success: true, 
      message: 'All game data cleared successfully',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error clearing game data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear game data' 
    });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Player joins game
  socket.on('join-game', (data) => {
    console.log('Received join-game event from socket:', socket.id);
    console.log('Join-game data:', data);
    const { playerCode, playerName, profession } = data;
    console.log('Player joining with data:', { playerCode, playerName, profession: profession?.name });
    
    // Check if player already exists
    const existingPlayer = players.get(playerCode);
    if (existingPlayer) {
      // Player exists - this is a reconnection
      existingPlayer.id = socket.id;
      existingPlayer.connected = true;
      
      // Update name if provided and not already set
      if (playerName && !existingPlayer.name) {
        existingPlayer.name = playerName;
      }
      
      // Update profession if provided and not already set
      if (profession && !existingPlayer.profession) {
        existingPlayer.profession = profession;
        existingPlayer.income = profession.salary || 0;
        existingPlayer.expenses = profession.totalExpenses || 0;
      }
      
      // Recalculate finances for reconnected player
      recalculatePlayerFinances(existingPlayer);
      
      players.set(playerCode, existingPlayer);
      console.log('Player reconnected:', playerCode, 'with name:', existingPlayer.name);
      
      // Always send updated player data to reconnected player
      setTimeout(() => {
        socket.emit('player-data-updated', { player: existingPlayer });
        console.log('Sent updated player data to reconnected player:', playerCode, 'with money:', existingPlayer.money);
      }, 100);
      
      // Clear pending updates flag and send any pending action results
      if (existingPlayer.hasPendingUpdates) {
        existingPlayer.hasPendingUpdates = false;
        console.log('Cleared pending updates flag for player:', playerCode);
        
        // Send notification about pending updates
        socket.emit('pending-updates-notification', {
          message: 'У вас есть обновления баланса. Проверьте ваш текущий баланс.'
        });
        console.log('Sent pending updates notification to player:', playerCode);
      }
      
      // Notify admin about player reconnection with updated data
      socket.to('admin-room').emit('player-updated', { 
        playerCode, 
        player: existingPlayer 
      });
    } else {
      // Store new player data
      const newPlayer = {
        id: socket.id,
        code: playerCode,
        name: playerName,
        profession,
        money: 0,
        assets: [],
        liabilities: [],
        income: profession.salary || 0,
        expenses: profession.totalExpenses || 0,
        children: 0,
        connected: true
      };
      players.set(playerCode, newPlayer);
      console.log('New player joined:', playerCode);
    }

    socket.join('game-room');
    console.log('Sending joined-game event to socket:', socket.id);
    socket.emit('joined-game', { playerCode, status: 'success' });
    console.log('Sent joined-game event successfully');
    
    // Send player data to new players only (existing players already got their data above)
    if (!existingPlayer) {
      setTimeout(() => {
        const currentPlayer = players.get(playerCode);
        if (currentPlayer) {
          socket.emit('player-data-updated', { player: currentPlayer });
          console.log('Sent initial player data to new player:', playerCode, 'with money:', currentPlayer.money);
        } else {
          console.log('ERROR: Player not found in storage after creation:', playerCode);
        }
      }, 100);
    }
    
    // Notify admin about new player
    const playerData = {
      playerCode,
      playerName,
      profession,
      timestamp: new Date()
    };
    console.log('Sending player-joined event:', playerData);
    socket.to('admin-room').emit('player-joined', playerData);
  });

  // Admin joins
  socket.on('admin-join', () => {
    console.log('Admin joining, socket ID:', socket.id);
    
    // Check if admin is already in the room to prevent duplicate data
    if (socket.rooms.has('admin-room')) {
      console.log('Admin already in admin-room, skipping duplicate join');
      return;
    }
    
    socket.join('admin-room');
    socket.emit('admin-joined', { status: 'success' });
    console.log('Admin joined admin-room');
    
    // Send current players to admin
    const currentPlayers = Array.from(players.values());
    console.log('Sending current players to admin:', currentPlayers.map(p => ({ code: p.code, name: p.name })));
    socket.emit('current-players', currentPlayers);
    
    // Send pending actions to admin
    const pendingActionsList = Array.from(pendingActions.values());
    console.log('Sending pending actions to admin:', pendingActionsList.length);
    console.log('Pending actions details:', pendingActionsList.map(a => ({ id: a.id, action: a.action, playerCode: a.playerCode })));
    if (pendingActionsList.length > 0) {
      socket.emit('pending-actions', pendingActionsList);
      console.log('Emitted pending-actions event to admin socket');
    } else {
      console.log('No pending actions to send to admin');
    }
  });

  // Player action request
  socket.on('player-action', (data) => {
    const { playerCode, action, details } = data;
    const player = players.get(playerCode);
    
    if (player) {
      // Check if similar action already exists for this player to prevent duplicates
      const existingAction = Array.from(pendingActions.values()).find(a => 
        a.playerCode === playerCode && 
        a.action === action && 
        JSON.stringify(a.details) === JSON.stringify(details) &&
        a.status === 'pending'
      );
      
      if (existingAction) {
        console.log('Similar action already exists, skipping duplicate:', existingAction.id);
        socket.emit('action-submitted', { status: 'pending', actionId: existingAction.id });
        return;
      }
      
      // Generate unique ID for the action
      const actionId = generateId();
      
      // Create action request object
      const actionRequest = {
        id: actionId,
        playerCode,
        action,
        details,
        status: 'pending',
        timestamp: new Date()
      };
      
      // Store the pending action
      pendingActions.set(actionId, actionRequest);
      
      // Notify admin about action request
      socket.to('admin-room').emit('action-request', actionRequest);
      
      socket.emit('action-submitted', { status: 'pending' });
    }
  });

  // Admin response to action
  socket.on('admin-response', (data) => {
    const { actionId, playerCode, action, approved, details } = data;
    const player = players.get(playerCode);
    
    console.log('Admin response received:', { actionId, playerCode, action, approved, details });
    console.log('Player found:', player);
    
    if (player && approved) {
      // Store player money before action
      const moneyBefore = player.money;
      console.log('Player money before action:', moneyBefore);
      
      // Process approved action
      processApprovedAction(player, action, details);
      
      // Log money change
      console.log('Player money after action:', player.money);
      console.log('Money change:', player.money - moneyBefore);
      
      // For transfers, get recipient info early
      let recipient = null;
      if (action === 'transfer-money' && details.recipientCode) {
        recipient = players.get(details.recipientCode);
      }
      
      // Find the player's socket and send result directly
      const playerSocket = io.sockets.sockets.get(player.id);
      if (playerSocket) {
        // For transfers, send special notification with transfer details
        if (action === 'transfer-money') {
          playerSocket.emit('action-result', {
            action,
            approved: true,
            details: {
              ...details,
              transferSuccess: true,
              recipientName: recipient?.name || details.recipientCode,
              amount: details.amount
            }
          });
          console.log('Sent transfer success result to player socket:', player.id);
        } else {
          playerSocket.emit('action-result', {
            action,
            approved: true,
            details
          });
          console.log('Sent action-result to player socket:', player.id);
        }
      } else {
        console.log('Player socket not found:', player.id);
        // Mark that player has pending updates when they reconnect
        player.hasPendingUpdates = true;
        console.log('Marked player as having pending updates for reconnection');
      }
      
      // Notify admin about player update after approved action
      console.log('Sending player-updated event to admin after approved action');
      io.to('admin-room').emit('player-updated', { 
        playerCode, 
        player: player 
      });
      
      // If this was a transfer, also notify the recipient
      if (action === 'transfer-money' && details.recipientCode && recipient) {
        if (recipient.id) {
          const recipientSocket = io.sockets.sockets.get(recipient.id);
          if (recipientSocket) {
            // Send updated player data
            recipientSocket.emit('player-data-updated', { player: recipient });
            console.log('Sent updated player data to transfer recipient:', details.recipientCode);
            
            // Send special transfer notification to recipient
            recipientSocket.emit('money-received', {
              amount: details.amount,
              fromPlayer: player.name || player.code,
              reason: details.reason || 'Перевод от игрока'
            });
            console.log('Sent money-received notification to transfer recipient:', details.recipientCode);
          }
        }
        
        // Also notify admin about recipient update using io.to instead of socket.to
        console.log('Sending recipient update to admin:', details.recipientCode, 'with money:', recipient.money);
        io.to('admin-room').emit('player-updated', { 
          playerCode: details.recipientCode, 
          player: recipient 
        });
      } else if (action === 'transfer-money' && details.recipientCode) {
        console.log('Recipient not found for admin notification:', details.recipientCode);
      }
    } else if (player) {
      // Find the player's socket and send result directly
      const playerSocket = io.sockets.sockets.get(player.id);
      if (playerSocket) {
        playerSocket.emit('action-result', {
          action,
          approved: false,
          reason: details.reason || 'Action denied'
        });
        console.log('Sent action-result (rejected) to player socket:', player.id);
      } else {
        console.log('Player socket not found:', player.id);
      }
    }
    
    // Remove the action from pending actions
    pendingActions.delete(actionId);
    
    // Notify admin that action was processed
    console.log('Sending action-processed event:', { actionId, playerCode, action, approved });
    socket.emit('action-processed', {
      actionId,
      playerCode,
      action,
      approved
    });
  });

  // Player requests updated data
  socket.on('get-player-data', (data) => {
    const { playerCode } = data;
    const player = players.get(playerCode);
    
    console.log('Player requesting data:', playerCode);
    console.log('Player data from storage:', player);
    
    if (player) {
      socket.emit('player-data-updated', { player });
      // Also notify admin about player update
      socket.to('admin-room').emit('player-updated', { playerCode, player });
      console.log('Sent updated player data to client');
    } else {
      console.log('Player not found in storage:', playerCode);
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    // Find player by socket ID
    for (const [code, player] of players.entries()) {
      if (player.id === socket.id) {
        // Don't delete the player immediately - they might reconnect
        // Just notify admin about disconnection
        socket.to('admin-room').emit('player-disconnected', { 
          playerCode: code,
          timestamp: new Date()
        });
        
        // Mark player as disconnected but keep their data
        player.connected = false;
        player.lastDisconnected = Date.now();
        players.set(code, player);
        console.log('Player marked as disconnected:', code);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Cash Flow Backend running on port ${PORT}`);
});
