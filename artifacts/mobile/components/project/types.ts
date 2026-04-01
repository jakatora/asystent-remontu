import type {
  ShoppingItem,
  ShoppingTier,
  ToolItem,
  ProjectPhoto,
  PhotoType,
  ChecklistItem,
  ProjectActivity,
  Project,
  RenovationJob,
  CalculationResult,
  BudgetEstimate,
} from '@/types/domain';

export type Tab = 'overview' | 'materials' | 'tools' | 'guide' | 'shopping' | 'budget' | 'photos';

export const TAB_LABELS: Record<Tab, string> = {
  overview: 'Przegląd',
  materials: 'Materiały',
  tools: 'Narzędzia',
  guide: 'Instrukcja',
  shopping: 'Zakupy',
  budget: 'Kosztorys',
  photos: 'Zdjęcia',
};

export const STATUS_COLORS = {
  planning:      { active: '#3B82F6', bg: '#EFF6FF',  border: '#BFDBFE' },
  'in-progress': { active: '#F59E0B', bg: '#FFFBEB',  border: '#FDE68A' },
  completed:     { active: '#22C55E', bg: '#F0FDF4',  border: '#BBF7D0' },
} as const;

export const TIER_META: Record<ShoppingTier, { label: string; color: string; bg: string }> = {
  economy:  { label: 'Eko',      color: '#059669', bg: '#ECFDF5' },
  standard: { label: 'Standard', color: '#3B82F6', bg: '#EFF6FF' },
  premium:  { label: 'Premium',  color: '#7C3AED', bg: '#F5F3FF' },
};

export const CONTINGENCY_RATE = 0.1;

export interface DiyAssessmentResult {
  level: 'hire' | 'moderate' | 'easy';
  color: string;
  bg: string;
  icon: string;
  headline: string;
  details: string;
}

export interface ProjectDetailData {
  project: Project;
  job: RenovationJob;
  calc: CalculationResult | undefined;
  shoppingItems: ShoppingItem[];
  photos: ProjectPhoto[];
  checklist: ChecklistItem[];
  checklistProgress: { completed: number; total: number };
  activities: ProjectActivity[];
  budget: BudgetEstimate | null;
  diy: DiyAssessmentResult;
}

export interface ProjectDetailActions {
  loadAll: () => Promise<void>;
  handleStatusChange: (status: 'planning' | 'in-progress' | 'completed') => Promise<void>;
  handleGenerateShoppingList: () => Promise<void>;
  handleGenerateChecklist: () => Promise<void>;
  handleToggleChecklist: (item: ChecklistItem) => Promise<void>;
  handleTogglePurchased: (item: ShoppingItem) => Promise<void>;
  handleToggleOwned: (item: ShoppingItem) => Promise<void>;
  handleStartEdit: (item: ShoppingItem) => void;
  handleSaveEdit: (item: ShoppingItem) => Promise<void>;
  handleRemoveItem: (item: ShoppingItem) => void;
  handleShare: () => Promise<void>;
  handleAddPhotoMenu: (photoType: PhotoType) => void;
  handleDeletePhoto: (photo: ProjectPhoto) => void;
  setTab: (tab: Tab) => void;
}

export interface ShoppingEditState {
  editingId: string | null;
  editPrice: string;
  editQty: string;
  setEditingId: (id: string | null) => void;
  setEditPrice: (v: string) => void;
  setEditQty: (v: string) => void;
}
