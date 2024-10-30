import { create } from 'zustand';
import { DetailedClaim } from '../types/claims';

interface ClaimState {
  claims: DetailedClaim[];
  addClaim: (claim: DetailedClaim) => void;
  updateClaim: (id: string, updates: Partial<DetailedClaim>) => void;
  getClaim: (id: string) => DetailedClaim | undefined;
}

export const useClaimStore = create<ClaimState>((set, get) => ({
  claims: [],
  addClaim: (claim) => set((state) => ({ 
    claims: [...state.claims, claim] 
  })),
  updateClaim: (id, updates) => set((state) => ({
    claims: state.claims.map((claim) =>
      claim.id === id ? { ...claim, ...updates } : claim
    ),
  })),
  getClaim: (id) => get().claims.find((claim) => claim.id === id),
}));