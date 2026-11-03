import { getDb } from '@/db/client';
import { createLocalContractorRequestsRepository } from '@/features/contractor/local-request-repository';

export const contractorRequestsRepo = createLocalContractorRequestsRepository(getDb);
