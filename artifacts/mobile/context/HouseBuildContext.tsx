import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react';

import type {
  HouseBuildProject,
  BuildProjectStatus,
  LandContext,
  PlanningContext,
  UtilityRequirement,
  UtilityType,
  UtilityStatus,
} from '@/types/house-build';

import {
  houseBuildRepo,
  type ChecklistItemRecord,
  type DocumentRecord,
} from '@/db/repositories/house-build.repo';

import { BUILD_STAGES } from '@/features/house-build/stages';

interface HouseBuildContextValue {
  readonly projects: HouseBuildProject[];
  readonly isLoading: boolean;

  createProject: (data: {
    name: string;
    landContext: LandContext;
    planningContext: PlanningContext;
  }) => Promise<string>;
  updateProject: (id: string, updates: Partial<Pick<HouseBuildProject, 'name' | 'status' | 'currentStageId' | 'notes'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  getProjectById: (id: string) => HouseBuildProject | undefined;

  getChecklist: (projectId: string, stageKey?: string) => Promise<ChecklistItemRecord[]>;
  toggleChecklistItem: (id: string, completed: boolean) => Promise<void>;
  seedChecklistForStage: (projectId: string, stageKey: string) => Promise<void>;

  getDocuments: (projectId: string, stageKey?: string) => Promise<DocumentRecord[]>;
  updateDocumentStatus: (id: string, status: string) => Promise<void>;
  seedDocumentsForStage: (projectId: string, stageKey: string) => Promise<void>;

  getUtilities: (projectId: string) => Promise<UtilityRequirement[]>;
  addUtility: (projectId: string, utilityType: UtilityType) => Promise<string>;
  updateUtility: (id: string, updates: { status?: UtilityStatus; providerName?: string; notes?: string }) => Promise<void>;
}

const HouseBuildContext = createContext<HouseBuildContextValue | null>(null);

export function HouseBuildProvider({ children }: PropsWithChildren) {
  const [projects, setProjects] = useState<HouseBuildProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    try {
      const all = await houseBuildRepo.findAllProjects();
      setProjects(all);
    } catch (err) {
      console.error('[HouseBuildContext] refresh error:', err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshProjects();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshProjects]);

  const createProject = useCallback(async (data: {
    name: string;
    landContext: LandContext;
    planningContext: PlanningContext;
  }) => {
    const id = await houseBuildRepo.createProject(data);
    await refreshProjects();
    return id;
  }, [refreshProjects]);

  const updateProject = useCallback(async (
    id: string,
    updates: Partial<Pick<HouseBuildProject, 'name' | 'status' | 'currentStageId' | 'notes'>>
  ) => {
    await houseBuildRepo.updateProject(id, updates);
    await refreshProjects();
  }, [refreshProjects]);

  const deleteProject = useCallback(async (id: string) => {
    await houseBuildRepo.deleteProject(id);
    await refreshProjects();
  }, [refreshProjects]);

  const getProjectById = useCallback((id: string) => {
    return projects.find((p) => p.id === id);
  }, [projects]);

  const getChecklist = useCallback(async (projectId: string, stageKey?: string) => {
    return houseBuildRepo.getChecklistForProject(projectId, stageKey);
  }, []);

  const toggleChecklistItem = useCallback(async (id: string, completed: boolean) => {
    await houseBuildRepo.toggleChecklistItem(id, completed);
  }, []);

  const seedChecklistForStage = useCallback(async (projectId: string, stageKey: string) => {
    const existing = await houseBuildRepo.getChecklistForProject(projectId, stageKey);
    if (existing.length > 0) return;
    const stageDef = BUILD_STAGES.find((s) => s.key === stageKey);
    if (!stageDef) return;
    for (const item of stageDef.defaultChecklist) {
      await houseBuildRepo.addChecklistItem(projectId, stageKey, {
        title: item.title,
        priority: item.priority,
        requiresProfessional: item.requiresProfessional,
        warningCategory: item.warningCategory,
      });
    }
  }, []);

  const getDocuments = useCallback(async (projectId: string, stageKey?: string) => {
    return houseBuildRepo.getDocumentsForProject(projectId, stageKey);
  }, []);

  const updateDocumentStatus = useCallback(async (id: string, status: string) => {
    await houseBuildRepo.updateDocumentStatus(id, status);
  }, []);

  const seedDocumentsForStage = useCallback(async (projectId: string, stageKey: string) => {
    const existing = await houseBuildRepo.getDocumentsForProject(projectId, stageKey);
    if (existing.length > 0) return;
    const stageDef = BUILD_STAGES.find((s) => s.key === stageKey);
    if (!stageDef) return;
    for (const doc of stageDef.defaultDocuments) {
      await houseBuildRepo.addDocument(projectId, stageKey, {
        name: doc.name,
        description: doc.description,
        isRequired: doc.isRequired,
      });
    }
  }, []);

  const getUtilities = useCallback(async (projectId: string) => {
    return houseBuildRepo.getUtilitiesForProject(projectId);
  }, []);

  const addUtility = useCallback(async (projectId: string, utilityType: UtilityType) => {
    return houseBuildRepo.addUtility(projectId, { utilityType });
  }, []);

  const updateUtility = useCallback(async (id: string, updates: { status?: UtilityStatus; providerName?: string; notes?: string }) => {
    await houseBuildRepo.updateUtility(id, updates);
  }, []);

  return (
    <HouseBuildContext.Provider
      value={{
        projects,
        isLoading,
        createProject,
        updateProject,
        deleteProject,
        refreshProjects,
        getProjectById,
        getChecklist,
        toggleChecklistItem,
        seedChecklistForStage,
        getDocuments,
        updateDocumentStatus,
        seedDocumentsForStage,
        getUtilities,
        addUtility,
        updateUtility,
      }}
    >
      {children}
    </HouseBuildContext.Provider>
  );
}

export function useHouseBuild(): HouseBuildContextValue {
  const ctx = useContext(HouseBuildContext);
  if (!ctx) throw new Error('useHouseBuild must be used within HouseBuildProvider');
  return ctx;
}
