const API_BASE_URL = 'http://localhost:5001/api';

export async function generatePlayerCode(): Promise<{ playerCode: string }> {
  const response = await fetch(`${API_BASE_URL}/player/generate-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to generate player code');
  }

  return response.json();
}

export async function checkHealth(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
  
  if (!response.ok) {
    throw new Error('Backend is not available');
  }

  return response.json();
}

export async function updatePlayer(playerCode: string, playerData: any): Promise<{ success: boolean; player: any }> {
  const response = await fetch(`${API_BASE_URL}/player/${playerCode}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(playerData),
  });

  if (!response.ok) {
    throw new Error('Failed to update player');
  }

  return response.json();
}

export async function getAllPlayers(): Promise<{ players: any[] }> {
  const response = await fetch(`${API_BASE_URL}/players`);
  
  if (!response.ok) {
    throw new Error('Failed to get players');
  }

  return response.json();
}

export async function deletePlayer(playerCode: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/player/${playerCode}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete player');
  }

  return response.json();
}

export async function getPlayersList(): Promise<{ players: Array<{ code: string; name: string; profession: string }> }> {
  const response = await fetch(`${API_BASE_URL}/players/list`);
  
  if (!response.ok) {
    throw new Error('Failed to get players list');
  }

  return response.json();
}

export async function clearAllData(): Promise<{ success: boolean; message: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/clear-all-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to clear all data');
  }

  return response.json();
}
