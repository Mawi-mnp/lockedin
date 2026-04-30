const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface User {
  id: number;
  username: string;
  email: string;
  commitment_score?: number;
  wallet_balance?: number;
  is_co_founder?: boolean;
  created_at?: string;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  creator_id: number;
  creator_username?: string;
  status: 'active' | 'completed' | 'failed';
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'penalty' | 'reward';
  description: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  target_amount: number;
  deadline: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
    }
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.access_token) {
      setToken(response.access_token);
    }
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.access_token) {
      setToken(response.access_token);
    }
    return response;
  },

  async logout(): Promise<void> {
    removeToken();
  },

  async getCurrentUser(): Promise<User> {
    return request<User>('/auth/me');
  },

  // Goals
  async getGoals(): Promise<Goal[]> {
    return request<Goal[]>('/goals/');
  },

  async getGoal(id: number): Promise<Goal> {
    return request<Goal>(`/goals/${id}`);
  },

  async createGoal(data: CreateGoalRequest): Promise<Goal> {
    return request<Goal>('/goals/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async contributeToGoal(goalId: number, amount: number): Promise<Goal> {
    return request<Goal>(`/goals/${goalId}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  async getUserGoals(userId: number): Promise<Goal[]> {
    return request<Goal[]>(`/goals/user/${userId}`);
  },

  // Profile
  async getProfile(userId: number | string): Promise<User> {
    if (userId === 'me') {
      return this.getCurrentUser();
    }
    return request<User>(`/users/${userId}`);
  },

  // Dashboard - composite endpoint
  async getDashboardData(): Promise<{
    user: User;
    goals: Goal[];
    transactions: Transaction[];
  }> {
    // Get user profile first
    const user = await this.getCurrentUser();
    
    // Get user's goals
    const goals = await this.getUserGoals(user.id);
    
    // For transactions, we'll return an empty array for now
    // This can be expanded when transactions endpoint is implemented
    const transactions: Transaction[] = [];
    
    return { user, goals, transactions };
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return request<Transaction[]>('/transactions');
  },
};

export { getToken, setToken, removeToken };
