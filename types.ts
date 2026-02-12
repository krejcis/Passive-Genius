export interface UserProfile {
  skills: string;
  budget: string;
  timeCommitment: string;
  interests: string;
}

export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard'
}

export interface IncomeIdea {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMonthlyRevenue: string;
  setupCost: string;
  timeToRevenue: string;
  tags: string[];
}

export interface BusinessPlanStep {
  phase: string;
  tasks: string[];
}

export interface FinancialProjection {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DetailedPlan {
  ideaId: string;
  overview: string;
  marketingStrategy: string;
  steps: BusinessPlanStep[];
  projections: FinancialProjection[];
}

export interface ChatMessage {
  id: string;
  user: string;
  avatar?: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface CommunityChannel {
  id: string;
  name: string;
  description: string;
  members: number;
  icon: string;
  messages: ChatMessage[];
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  MAIN_APP = 'MAIN_APP', // Handles Discover, Saved, Community
  GENERATING = 'GENERATING',
  REFINING = 'REFINING',
  PLANNING = 'PLANNING',
  DETAIL = 'DETAIL'
}

export type MainTab = 'discover' | 'saved' | 'community' | 'profile';