export async function getAdminStats() {
  const response = await fetch('/api/admin/stats', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch admin stats');
  }
  
  return response.json();
}

export async function getLeaderboard() {
  const response = await fetch('/api/leaderboard/artists?limit=10', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  
  return response.json();
}

export async function getBattles(genreId?: string, status?: string) {
  const params = new URLSearchParams();
  if (genreId) params.append('genreId', genreId);
  if (status) params.append('status', status);
  
  const response = await fetch(`/api/battles?${params.toString()}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch battles');
  }
  
  return response.json();
}

export async function getGenres() {
  const response = await fetch('/api/genres', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch genres');
  }
  
  return response.json();
}

export async function createBattle(battleData: any) {
  const response = await fetch('/api/battles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(battleData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create battle');
  }
  
  return response.json();
}

export async function submitTrack(trackData: any) {
  const response = await fetch('/api/tracks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(trackData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit track');
  }
  
  return response.json();
}

export async function submitVote(voteData: any) {
  const response = await fetch('/api/votes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(voteData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit vote');
  }
  
  return response.json();
}

export async function getTrialSlots(genreId: string) {
  const response = await fetch(`/api/trial-slots/${genreId}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch trial slots');
  }
  
  return response.json();
}
