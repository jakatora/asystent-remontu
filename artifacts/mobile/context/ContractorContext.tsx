import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type PropsWithChildren,
} from 'react';

import type {
  ContractorProfile,
  ContractorRequest,
  ContractorSearchFilters,
  ContractorSortOption,
  SavedContractor,
  RequestStatus,
} from '@/types/contractor';

import {
  MOCK_CONTRACTORS,
  filterContractors,
  sortContractors,
  searchContractorsByText,
  countMatchingContractors,
} from '@/features/contractor';

import { contractorRequestsRepo } from '@/db/repositories/contractor-requests.repo';
import { savedContractorsRepo } from '@/db/repositories/saved-contractors.repo';

interface ContractorContextValue {
  readonly contractors: ContractorProfile[];
  readonly filteredContractors: ContractorProfile[];
  readonly requests: ContractorRequest[];
  readonly savedContractorIds: Set<string>;
  readonly filters: ContractorSearchFilters;
  readonly sortOption: ContractorSortOption;
  readonly searchQuery: string;
  readonly isLoading: boolean;

  setFilters: (filters: ContractorSearchFilters) => void;
  setSortOption: (sort: ContractorSortOption) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;

  getContractorById: (id: string) => ContractorProfile | undefined;
  getMatchCount: (categoryId?: string, city?: string) => number;

  saveRequest: (request: Omit<ContractorRequest, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<string>;
  updateRequestStatus: (id: string, status: RequestStatus) => Promise<void>;
  removeRequest: (id: string) => Promise<void>;
  refreshRequests: () => Promise<void>;

  toggleSaveContractor: (contractorId: string) => Promise<void>;
  isContractorSaved: (contractorId: string) => boolean;
}

const ContractorContext = createContext<ContractorContextValue | null>(null);

const EMPTY_FILTERS: ContractorSearchFilters = {};

export function ContractorProvider({ children }: PropsWithChildren) {
  const [contractors] = useState<ContractorProfile[]>(MOCK_CONTRACTORS);
  const [requests, setRequests] = useState<ContractorRequest[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ContractorSearchFilters>(EMPTY_FILTERS);
  const [sortOption, setSortOption] = useState<ContractorSortOption>('best-match');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [reqs, saved] = await Promise.all([
          contractorRequestsRepo.findAll(),
          savedContractorsRepo.findAll(),
        ]);
        setRequests(reqs);
        setSavedIds(new Set(saved.map((s) => s.contractorId)));
      } catch {
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filteredContractors = React.useMemo(() => {
    let result = searchContractorsByText(contractors, searchQuery);
    result = filterContractors(result, filters);
    result = sortContractors(result, sortOption);
    return result;
  }, [contractors, filters, sortOption, searchQuery]);

  const getContractorById = useCallback(
    (id: string) => contractors.find((c) => c.id === id),
    [contractors],
  );

  const getMatchCount = useCallback(
    (categoryId?: string, city?: string) => countMatchingContractors(contractors, categoryId, city),
    [contractors],
  );

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setSortOption('best-match');
    setSearchQuery('');
  }, []);

  const saveRequest = useCallback(
    async (data: Omit<ContractorRequest, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
      const id = await contractorRequestsRepo.upsert(data);
      const reqs = await contractorRequestsRepo.findAll();
      setRequests(reqs);
      return id;
    },
    [],
  );

  const updateRequestStatus = useCallback(async (id: string, status: RequestStatus) => {
    await contractorRequestsRepo.updateStatus(id, status);
    const reqs = await contractorRequestsRepo.findAll();
    setRequests(reqs);
  }, []);

  const removeRequest = useCallback(async (id: string) => {
    await contractorRequestsRepo.remove(id);
    const reqs = await contractorRequestsRepo.findAll();
    setRequests(reqs);
  }, []);

  const refreshRequests = useCallback(async () => {
    const reqs = await contractorRequestsRepo.findAll();
    setRequests(reqs);
  }, []);

  const toggleSaveContractor = useCallback(async (contractorId: string) => {
    const isSaved = savedIds.has(contractorId);
    if (isSaved) {
      await savedContractorsRepo.remove(contractorId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(contractorId);
        return next;
      });
    } else {
      await savedContractorsRepo.save(contractorId);
      setSavedIds((prev) => new Set(prev).add(contractorId));
    }
  }, [savedIds]);

  const isContractorSaved = useCallback(
    (contractorId: string) => savedIds.has(contractorId),
    [savedIds],
  );

  const value: ContractorContextValue = {
    contractors,
    filteredContractors,
    requests,
    savedContractorIds: savedIds,
    filters,
    sortOption,
    searchQuery,
    isLoading,
    setFilters,
    setSortOption,
    setSearchQuery,
    resetFilters,
    getContractorById,
    getMatchCount,
    saveRequest,
    updateRequestStatus,
    removeRequest,
    refreshRequests,
    toggleSaveContractor,
    isContractorSaved,
  };

  return (
    <ContractorContext.Provider value={value}>
      {children}
    </ContractorContext.Provider>
  );
}

export function useContractor(): ContractorContextValue {
  const ctx = useContext(ContractorContext);
  if (!ctx) throw new Error('useContractor must be used within ContractorProvider');
  return ctx;
}
