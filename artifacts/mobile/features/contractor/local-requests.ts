import type { ContractorRequest, RequestStatus } from '@/types/contractor';
import { BUDGET_RANGE_LABELS } from '@/types/contractor';

// These capabilities stay unavailable until backed by real accounts and
// recipient delivery. A local status or a sample profile is not that evidence.
export const CONTRACTOR_DIRECTORY_AVAILABLE = false;

export function isLocalContractorRoute(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '');
  return [
    '/contractor',
    '/contractor/my-requests',
    '/contractor/send-request',
    '/contractor/unavailable',
  ].includes(path);
}

export type LocalRequestInput = Omit<
  ContractorRequest,
  'id' | 'createdAt' | 'updatedAt'
> & { id?: string };

export function localRequestDraft(input: LocalRequestInput): LocalRequestInput {
  return {
    ...input,
    status: 'draft',
    sentAt: undefined,
    estimatedMatchCount: undefined,
  };
}

export function assertLocalRequestStatus(status: RequestStatus): void {
  if (status !== 'draft') throw new Error('contractor_delivery_unavailable');
}

export function contractorRequestText(
  request: Pick<
    ContractorRequest,
    | 'workDescription'
    | 'city'
    | 'postalCode'
    | 'preferredDate'
    | 'notes'
    | 'roomDescription'
    | 'jobName'
  > &
    Partial<Pick<ContractorRequest, 'categoryName' | 'budgetRange'>>,
  language: 'pl' | 'en',
): string {
  const pl = language === 'pl';
  const englishBudgets = {
    any: 'To be agreed',
    low: 'Up to PLN 5,000',
    medium: 'PLN 5,000–20,000',
    high: 'Above PLN 20,000',
  };
  return [
    pl
      ? 'Zakres prac — zapytanie o wykonanie'
      : 'Scope of work — request for a quote',
    request.jobName ?? request.categoryName,
    request.roomDescription,
    request.workDescription,
    `${pl ? 'Miejscowość' : 'Location'}: ${request.city}${request.postalCode ? `, ${request.postalCode}` : ''}`,
    request.preferredDate
      ? `${pl ? 'Preferowany termin' : 'Preferred date'}: ${request.preferredDate}`
      : undefined,
    request.budgetRange
      ? `${pl ? 'Budżet' : 'Budget'}: ${pl ? BUDGET_RANGE_LABELS[request.budgetRange] : englishBudgets[request.budgetRange]}`
      : undefined,
    request.notes ? `${pl ? 'Uwagi' : 'Notes'}: ${request.notes}` : undefined,
  ]
    .filter(Boolean)
    .join('\n\n');
}
