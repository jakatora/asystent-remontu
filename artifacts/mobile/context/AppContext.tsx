import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react';

import type { Project, ShoppingItem, ShoppingTier, RenovationJob } from '@/types/domain';
import type { CalculationResult } from '@/types/domain';
import { projectsRepo } from '@/db/repositories/projects.repo';
import { shoppingRepo } from '@/db/repositories/shopping.repo';
import { onboardingRepo } from '@/db/repositories/onboarding.repo';
import { generateShoppingItems, generateAllShoppingItems } from '@/features/calculator/shopping';

interface AppContextValue {
  readonly projects: Project[];
  readonly onboardingDone: boolean;
  readonly isLoading: boolean;

  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProject: (project: Project) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;

  completeOnboarding: () => Promise<void>;

  getProjectShoppingItems: (projectId: string) => Promise<ShoppingItem[]>;
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => Promise<string>;
  generateAndAddShoppingItems: (projectId: string, result: CalculationResult, job?: RenovationJob) => Promise<string[]>;
  toggleItem: (id: string, purchased: boolean) => Promise<void>;
  setItemOwned: (id: string, owned: boolean) => Promise<void>;
  updateItemPrice: (id: string, price: number) => Promise<void>;
  updateItemQuantity: (id: string, quantity: number) => Promise<void>;
  setItemTier: (id: string, tier: ShoppingTier) => Promise<void>;
  removeShoppingItem: (id: string) => Promise<void>;
  clearProjectShoppingItems: (projectId: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const [projs, done] = await Promise.all([
          projectsRepo.findAll(),
          onboardingRepo.isCompleted(),
        ]);
        if (mounted) {
          setProjects(projs);
          setOnboardingDone(done);
        }
      } catch (err) {
        console.error('[AppContext] init error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  const refreshProjects = useCallback(async () => {
    const projs = await projectsRepo.findAll();
    setProjects(projs);
  }, []);

  const createProject = useCallback(
    async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      const id = await projectsRepo.upsert(data);
      const created = await projectsRepo.findById(id);
      if (created) {
        setProjects((prev) => [created, ...prev]);
      }
      return id;
    },
    []
  );

  const updateProject = useCallback(async (project: Project): Promise<void> => {
    await projectsRepo.update(project);
    const updated = await projectsRepo.findById(project.id);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
  }, []);

  const removeProject = useCallback(async (id: string): Promise<void> => {
    await projectsRepo.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const completeOnboarding = useCallback(async (): Promise<void> => {
    await onboardingRepo.markCompleted();
    setOnboardingDone(true);
  }, []);

  const getProjectShoppingItems = useCallback(
    async (projectId: string): Promise<ShoppingItem[]> => {
      return shoppingRepo.findByProject(projectId);
    },
    []
  );

  const addShoppingItem = useCallback(
    async (item: Omit<ShoppingItem, 'id'>): Promise<string> => {
      return shoppingRepo.insert(item);
    },
    []
  );

  const generateAndAddShoppingItems = useCallback(
    async (projectId: string, result: CalculationResult, job?: RenovationJob): Promise<string[]> => {
      await shoppingRepo.deleteByProject(projectId);
      const items = job
        ? generateAllShoppingItems(projectId, result, job)
        : generateShoppingItems(projectId, result);
      return shoppingRepo.insertMany(items);
    },
    []
  );

  const toggleItem = useCallback(async (id: string, purchased: boolean): Promise<void> => {
    await shoppingRepo.toggle(id, purchased);
  }, []);

  const setItemOwned = useCallback(async (id: string, owned: boolean): Promise<void> => {
    await shoppingRepo.setOwned(id, owned);
  }, []);

  const updateItemPrice = useCallback(async (id: string, price: number): Promise<void> => {
    await shoppingRepo.updatePrice(id, price);
  }, []);

  const updateItemQuantity = useCallback(async (id: string, quantity: number): Promise<void> => {
    await shoppingRepo.updateQuantity(id, quantity);
  }, []);

  const setItemTier = useCallback(async (id: string, tier: ShoppingTier): Promise<void> => {
    await shoppingRepo.setTier(id, tier);
  }, []);

  const removeShoppingItem = useCallback(async (id: string): Promise<void> => {
    await shoppingRepo.delete(id);
  }, []);

  const clearProjectShoppingItems = useCallback(async (projectId: string): Promise<void> => {
    await shoppingRepo.deleteByProject(projectId);
  }, []);

  const value: AppContextValue = {
    projects,
    onboardingDone,
    isLoading,
    createProject,
    updateProject,
    removeProject,
    refreshProjects,
    completeOnboarding,
    getProjectShoppingItems,
    addShoppingItem,
    generateAndAddShoppingItems,
    toggleItem,
    setItemOwned,
    updateItemPrice,
    updateItemQuantity,
    setItemTier,
    removeShoppingItem,
    clearProjectShoppingItems,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
