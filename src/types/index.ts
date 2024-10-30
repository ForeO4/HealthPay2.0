export interface User {
  id: string;
  name: string;
  email: string;
  role: 'consumer' | 'provider' | 'payer';
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  provider: string;
  description: string;
}

export interface Claim {
  id: string;
  date: string;
  provider: string;
  amount: number;
  status: 'pending' | 'approved' | 'denied';
  description: string;
}