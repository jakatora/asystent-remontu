import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react';

import type { Project, ShoppingItem } from '@/types/domain';
import { projectsRepo } from '@/db/repositories/projects.repo';
import { shoppingRepo } from '@/db/repositories/shopping.repo';
import { onboardingRepo } from '@/db/repositories/onboarding.repo';
import { generateShoppingItems } from '@/features/calculator/shopping';
import type { CalculationResult } from '@/types/domain';

// ─── Context value contract ──────────────────────────────────────────────────

interface AppContextValue {
  readonly projects: Project[];
  readonly onboardingDone: boolean;
  readonly isLoading: boolean;

  // Projects
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProject: (project: Project) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;

  // Onboarding
  completeOnboarding: () => Promise<void>;

  // Shopping
  getProjectShoppingItems: (projectId: string) => Promise<ShoppingItem[]>;
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => Promise<string>;
  generateAndAddShoppingItems: (projectId: string, result: CalculationResult) => Promise<string[]>;
  toggleItem: (id: string, purchased: boolean) => Promise<void>;
  removeShoppingItem: (id: string) => Promise<void>;
  clearProjectShoppingItems: (projectId: string) => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

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
    async (projectId: string, result: CalculationResult): Promise<string[]> => {
      // Clear existing items first (idempotent regeneration)
      await shoppingRepo.deleteByProject(projectId);
      const items = generateShoppingItems(projectId, result);
      return shoppingRepo.insertMany(items);
    },
    []
  );

  const toggleItem = useCallback(async (id: string, purchased: boolean): Promise<void> => {
    await shoppingRepo.toggle(id, purchased);
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
    removeShoppingItem,
    clearProjectShoppingItems,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
