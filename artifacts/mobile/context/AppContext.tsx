import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react';

import type {
  Project,
  ShoppingItem,
  ShoppingTier,
  RenovationJob,
  ProjectPhoto,
  PhotoType,
  ChecklistItem,
  ProjectActivity,
} from '@/types/domain';
import type { CalculationResult } from '@/types/domain';
import { projectsRepo } from '@/db/repositories/projects.repo';
import { shoppingRepo } from '@/db/repositories/shopping.repo';
import { onboardingRepo } from '@/db/repositories/onboarding.repo';
import { photosRepo } from '@/db/repositories/photos.repo';
import { checklistRepo } from '@/db/repositories/checklist.repo';
import { activityRepo } from '@/db/repositories/activity.repo';
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

  getProjectPhotos: (projectId: string) => Promise<ProjectPhoto[]>;
  addPhoto: (data: Omit<ProjectPhoto, 'id' | 'createdAt'>) => Promise<string>;
  removePhoto: (id: string) => Promise<void>;

  getProjectChecklist: (projectId: string) => Promise<ChecklistItem[]>;
  generateChecklist: (projectId: string, job: RenovationJob) => Promise<void>;
  toggleChecklistItem: (id: string, completed: boolean) => Promise<void>;
  getChecklistProgress: (projectId: string) => Promise<{ completed: number; total: number }>;

  getProjectActivities: (projectId: string, limit?: number) => Promise<ProjectActivity[]>;
  getRecentActivities: (limit?: number) => Promise<ProjectActivity[]>;
  logActivity: (projectId: string, actionType: ProjectActivity['actionType'], description: string) => Promise<void>;
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
      await activityRepo.insert({
        projectId: id,
        actionType: 'created',
        description: `Utworzono projekt "${data.name}"`,
      });
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
    async (projectId: string): Promise<ShoppingItem[]> => shoppingRepo.findByProject(projectId),
    []
  );

  const addShoppingItem = useCallback(
    async (item: Omit<ShoppingItem, 'id'>): Promise<string> => shoppingRepo.insert(item),
    []
  );

  const generateAndAddShoppingItems = useCallback(
    async (projectId: string, result: CalculationResult, job?: RenovationJob): Promise<string[]> => {
      await shoppingRepo.deleteByProject(projectId);
      const items = job
        ? generateAllShoppingItems(projectId, result, job)
        : generateShoppingItems(projectId, result);
      const ids = await shoppingRepo.insertMany(items);
      await activityRepo.insert({
        projectId,
        actionType: 'shopping_generated',
        description: `Wygenerowano listę zakupów (${items.length} pozycji)`,
      });
      return ids;
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

  const getProjectPhotos = useCallback(
    async (projectId: string): Promise<ProjectPhoto[]> => photosRepo.findByProject(projectId),
    []
  );

  const addPhoto = useCallback(
    async (data: Omit<ProjectPhoto, 'id' | 'createdAt'>): Promise<string> => {
      const id = await photosRepo.insert(data);
      const typeLabels: Record<PhotoType, string> = {
        before: 'przed remontem',
        during: 'w trakcie remontu',
        after: 'po remoncie',
      };
      await activityRepo.insert({
        projectId: data.projectId,
        actionType: 'photo_added',
        description: `Dodano zdjęcie: ${typeLabels[data.photoType]}`,
      });
      return id;
    },
    []
  );

  const removePhoto = useCallback(async (id: string): Promise<void> => {
    await photosRepo.delete(id);
  }, []);

  const getProjectChecklist = useCallback(
    async (projectId: string): Promise<ChecklistItem[]> => checklistRepo.findByProject(projectId),
    []
  );

  const generateChecklist = useCallback(
    async (projectId: string, job: RenovationJob): Promise<void> => {
      await checklistRepo.deleteByProject(projectId);
      const items: Omit<ChecklistItem, 'id' | 'createdAt'>[] = job.instructions.map((step) => ({
        projectId,
        stepIndex: step.step,
        title: step.title,
        description: step.description,
        completed: false,
      }));
      await checklistRepo.insertMany(items);
    },
    []
  );

  const toggleChecklistItem = useCallback(
    async (id: string, completed: boolean): Promise<void> => {
      await checklistRepo.toggle(id, completed);
    },
    []
  );

  const getChecklistProgress = useCallback(
    async (projectId: string): Promise<{ completed: number; total: number }> =>
      checklistRepo.completedCount(projectId),
    []
  );

  const getProjectActivities = useCallback(
    async (projectId: string, limit = 20): Promise<ProjectActivity[]> =>
      activityRepo.findByProject(projectId, limit),
    []
  );

  const getRecentActivities = useCallback(
    async (limit = 10): Promise<ProjectActivity[]> =>
      activityRepo.findRecent(limit),
    []
  );

  const logActivity = useCallback(
    async (projectId: string, actionType: ProjectActivity['actionType'], description: string): Promise<void> => {
      await activityRepo.insert({ projectId, actionType, description });
    },
    []
  );

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
    getProjectPhotos,
    addPhoto,
    removePhoto,
    getProjectChecklist,
    generateChecklist,
    toggleChecklistItem,
    getChecklistProgress,
    getProjectActivities,
    getRecentActivities,
    logActivity,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
