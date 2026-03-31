import React, { createContext, useContext, useState, useEffect, useCallback, PropsWithChildren } from 'react';
import { Project, ShoppingItem } from '@/types/renovation';
import {
  getAllProjects,
  saveProject,
  deleteProject,
  getShoppingItems,
  saveShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  isOnboardingCompleted,
  markOnboardingCompleted,
} from '@/storage/database';

interface AppContextValue {
  projects: Project[];
  onboardingDone: boolean;
  isLoading: boolean;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProject: (project: Project) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  getProjectShoppingItems: (projectId: string) => Promise<ShoppingItem[]>;
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => Promise<string>;
  toggleItem: (id: string, purchased: boolean) => Promise<void>;
  removeShoppingItem: (id: string) => Promise<void>;
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
          getAllProjects(),
          isOnboardingCompleted(),
        ]);
        if (mounted) {
          setProjects(projs as Project[]);
          setOnboardingDone(done);
        }
      } catch (e) {
        console.error('AppContext init error:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  const refreshProjects = useCallback(async () => {
    const projs = await getAllProjects();
    setProjects(projs as Project[]);
  }, []);

  const createProject = useCallback(async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const project: Project = { ...data, id, createdAt: now, updatedAt: now };
    await saveProject(project);
    setProjects((prev) => [project, ...prev]);
    return id;
  }, []);

  const updateProject = useCallback(async (project: Project) => {
    const updated = { ...project, updatedAt: new Date().toISOString() };
    await saveProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const removeProject = useCallback(async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const completeOnboarding = useCallback(async () => {
    await markOnboardingCompleted();
    setOnboardingDone(true);
  }, []);

  const getProjectShoppingItems = useCallback(async (projectId: string): Promise<ShoppingItem[]> => {
    const items = await getShoppingItems(projectId);
    return items as ShoppingItem[];
  }, []);

  const addShoppingItem = useCallback(async (item: Omit<ShoppingItem, 'id'>): Promise<string> => {
    const id = await saveShoppingItem({ ...item, id: undefined });
    return id;
  }, []);

  const toggleItem = useCallback(async (id: string, purchased: boolean) => {
    await toggleShoppingItem(id, purchased);
  }, []);

  const removeShoppingItem = useCallback(async (id: string) => {
    await deleteShoppingItem(id);
  }, []);

  return (
    <AppContext.Provider value={{
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
      toggleItem,
      removeShoppingItem,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
