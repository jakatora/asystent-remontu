export type LegalPathType = 'mpzp' | 'wz' | 'special';

export type HouseType =
  | 'detached'
  | 'semi-detached'
  | 'row-house'
  | 'modular'
  | 'other';

export type UserConfidenceLevel = 'beginner' | 'some-experience' | 'experienced';

export type PlanningMode = 'planning-only' | 'planning-and-contractors';

export type BuildProjectStatus =
  | 'planning'
  | 'formalities'
  | 'in-progress'
  | 'paused'
  | 'completed';

export type BuildStageStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

export type StageGateStatus =
  | 'not-started'
  | 'in-progress'
  | 'waiting-for-verification'
  | 'ready-for-next-stage'
  | 'blocked'
  | 'warning';

export interface StageCompletionCriteria {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly isRequired: boolean;
}

export interface BeforeNextStageCheck {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: 'required' | 'recommended';
}

export interface EnergyPlanningData {
  readonly targetEP: string;
  readonly wallUTarget: string;
  readonly roofUTarget: string;
  readonly floorUTarget: string;
  readonly heatingVentilationNotes: string;
}

export type DocumentStatus = 'missing' | 'in-progress' | 'obtained' | 'not-needed';

export type ChecklistItemPriority = 'low' | 'normal' | 'high' | 'critical';

export type WarningCategory =
  | 'formal-legal'
  | 'technical-documentation'
  | 'professional-required'
  | 'safety'
  | 'not-diy';

export type WarningLevel = 'info' | 'warning' | 'danger';

export type SourceType = 'official' | 'technical' | 'market' | 'community';

export type ProfessionalRole =
  | 'architect'
  | 'structural-engineer'
  | 'geodesist'
  | 'electrician'
  | 'plumber'
  | 'gas-installer'
  | 'roofer'
  | 'general-contractor'
  | 'building-inspector'
  | 'interior-designer'
  | 'chimney-sweep'
  | 'energy-auditor';

export type UtilityType =
  | 'electricity'
  | 'water'
  | 'sewage'
  | 'gas'
  | 'telecom'
  | 'heating';

export type UtilityStatus = 'not-started' | 'applied' | 'in-progress' | 'connected';

export interface SourceMetadata {
  readonly sourceLabel: string;
  readonly sourceType: SourceType;
  readonly lastReviewedDate: string;
  readonly classification: 'official' | 'technical' | 'market';
  readonly notes?: string;
}

export interface LandContext {
  readonly hasMpzp: boolean | null;
  readonly hasWz: boolean | null;
  readonly plotCity: string;
  readonly plotNumber?: string;
  readonly plotArea?: number;
}

export interface PlanningContext {
  readonly legalPath: LegalPathType | null;
  readonly houseType: HouseType;
  readonly approximateFootprint: number | null;
  readonly floorsAboveGround: number;
  readonly forOwnHousing: boolean;
  readonly userConfidence: UserConfidenceLevel;
  readonly planningMode: PlanningMode;
}

export interface HouseBuildProject {
  readonly id: string;
  readonly name: string;
  readonly status: BuildProjectStatus;
  readonly landContext: LandContext;
  readonly planningContext: PlanningContext;
  readonly currentStageId: string | null;
  readonly notes: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BuildStage {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly order: number;
  readonly status: BuildStageStatus;
  readonly estimatedWeeks: number | null;
  readonly requiredProfessionals: readonly ProfessionalRole[];
  readonly warnings: readonly ConstructionRiskNotice[];
  readonly checklist: readonly BuildChecklistItem[];
  readonly source?: SourceMetadata;
}

export interface BuildChecklistItem {
  readonly id: string;
  readonly stageId: string;
  readonly title: string;
  readonly description?: string;
  readonly completed: boolean;
  readonly completedAt?: string;
  readonly priority: ChecklistItemPriority;
  readonly requiresProfessional: boolean;
  readonly warningCategory?: WarningCategory;
  readonly source?: SourceMetadata;
}

export interface DocumentRequirement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly stageId: string;
  readonly status: DocumentStatus;
  readonly isRequired: boolean;
  readonly obtainedAt?: string;
  readonly source?: SourceMetadata;
}

export interface OfficialProcessStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly order: number;
  readonly stageId: string;
  readonly estimatedDays: number | null;
  readonly officeName?: string;
  readonly requiredDocuments: readonly string[];
  readonly source?: SourceMetadata;
}

export interface UtilityRequirement {
  readonly id: string;
  readonly projectId: string;
  readonly utilityType: UtilityType;
  readonly providerName: string;
  readonly status: UtilityStatus;
  readonly applicationDate?: string;
  readonly connectionDate?: string;
  readonly notes: string;
}

export interface ProfessionalRoleRequirement {
  readonly role: ProfessionalRole;
  readonly label: string;
  readonly description: string;
  readonly whenNeeded: string;
  readonly isRequired: boolean;
}

export interface ConstructionRiskNotice {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly warningCategory: WarningCategory;
  readonly warningLevel: WarningLevel;
  readonly source?: SourceMetadata;
}

export interface BuildProjectTimelineItem {
  readonly id: string;
  readonly projectId: string;
  readonly stageId: string;
  readonly title: string;
  readonly plannedStart?: string;
  readonly plannedEnd?: string;
  readonly actualStart?: string;
  readonly actualEnd?: string;
  readonly notes: string;
}

export type FormalPathId =
  | 'building-permit'
  | 'notification-with-design'
  | 'simplified-70m2';

export interface FormalPathAssessment {
  readonly hasMpzp: boolean | null;
  readonly hasWz: boolean | null;
  readonly isSingleFamily: boolean;
  readonly isFreeStanding: boolean;
  readonly footprintArea: number | null;
  readonly floorsAboveGround: number;
  readonly forOwnHousing: boolean;
  readonly isFirstTimeInvestor: boolean;
  readonly prefersConservativePath: boolean;
  readonly recommendedPath: FormalPathId;
  readonly alternativePaths: readonly FormalPathId[];
  readonly cautionNotes: readonly FormalCautionNote[];
}

export interface FormalCautionNote {
  readonly id: string;
  readonly text: string;
  readonly level: 'info' | 'caution' | 'important';
  readonly source?: SourceMetadata;
}

export interface FormalQuestion {
  readonly id: string;
  readonly text: string;
  readonly helpText?: string;
  readonly type: 'boolean' | 'number' | 'choice';
  readonly options?: readonly { value: string; label: string }[];
}

export interface FormalRequirementItem {
  readonly id: string;
  readonly groupId: string;
  readonly title: string;
  readonly description: string;
  readonly isRequired: boolean;
  readonly order: number;
  readonly source?: SourceMetadata;
}

export interface OfficialChecklistGroup {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly items: readonly FormalRequirementItem[];
  readonly pathIds: readonly FormalPathId[];
  readonly source?: SourceMetadata;
}

export interface StartWorksChecklistItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly isRequired: boolean;
  readonly category: 'formal' | 'site' | 'utility';
  readonly source?: SourceMetadata;
}

export interface CompletionChecklistItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly isRequired: boolean;
  readonly path: 'notice' | 'permit' | 'both';
  readonly source?: SourceMetadata;
}

export interface OfficialSourceLink {
  readonly id: string;
  readonly label: string;
  readonly url: string;
  readonly description: string;
  readonly lastVerified: string;
}

export type TimelineStageStatus =
  | 'not-started'
  | 'in-progress'
  | 'waiting-for-verification'
  | 'ready-for-next-stage'
  | 'blocked'
  | 'completed'
  | 'skipped';

export type TimelineNoteType =
  | 'weather-sensitive'
  | 'waiting-for-inspection'
  | 'waiting-for-materials'
  | 'waiting-for-contractor'
  | 'blocked-by-earlier-stage'
  | 'decision-required'
  | 'custom';

export type StageCostCategory =
  | 'design-formal'
  | 'labor'
  | 'materials'
  | 'equipment-transport'
  | 'contingency'
  | 'custom';

export type BudgetCompletenessState =
  | 'no-estimate'
  | 'partial'
  | 'complete-planning'
  | 'user-confirmed';

export type ProfessionalNeedState =
  | 'not-decided'
  | 'has-contractor'
  | 'search-later'
  | 'owner-managed';

export type StageManagementMode = 'self' | 'contractor' | 'mixed';

export interface TimelineStageRecord {
  readonly id: string;
  readonly projectId: string;
  readonly stageKey: string;
  readonly status: TimelineStageStatus;
  readonly customName: string | null;
  readonly sortOrder: number;
  readonly estimatedWeeks: number | null;
  readonly plannedStart: string | null;
  readonly plannedEnd: string | null;
  readonly actualStart: string | null;
  readonly actualEnd: string | null;
  readonly managementMode: StageManagementMode;
  readonly notes: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface StageBudgetItem {
  readonly id: string;
  readonly projectId: string;
  readonly stageKey: string;
  readonly category: StageCostCategory;
  readonly label: string;
  readonly amountLow: number | null;
  readonly amountHigh: number | null;
  readonly userOverride: number | null;
  readonly notes: string;
  readonly createdAt: string;
}

export interface StageBudgetNote {
  readonly id: string;
  readonly projectId: string;
  readonly stageKey: string;
  readonly text: string;
  readonly createdAt: string;
}

export interface BuildTimelineMilestone {
  readonly id: string;
  readonly projectId: string;
  readonly key: string;
  readonly label: string;
  readonly status: 'pending' | 'reached' | 'skipped';
  readonly plannedDate: string | null;
  readonly completedDate: string | null;
  readonly notes: string;
  readonly sortOrder: number;
  readonly createdAt: string;
}

export interface TimelineNoteRecord {
  readonly id: string;
  readonly projectId: string;
  readonly stageKey: string;
  readonly noteType: TimelineNoteType;
  readonly text: string;
  readonly createdAt: string;
}

export interface StageProfessionalPlan {
  readonly id: string;
  readonly projectId: string;
  readonly stageKey: string;
  readonly role: ProfessionalRole;
  readonly needState: ProfessionalNeedState;
  readonly contractorName: string | null;
  readonly notes: string;
  readonly createdAt: string;
}

export interface EnergyStrategyRecord {
  readonly id: string;
  readonly projectId: string;
  readonly heatingConcept: string;
  readonly ventilationConcept: string;
  readonly insulationNotes: string;
  readonly windowStandard: string;
  readonly isDecided: boolean;
  readonly updatedAt: string;
}

export interface HouseBuildBudget {
  readonly projectId: string;
  readonly items: readonly StageBudgetItem[];
  readonly totalLow: number;
  readonly totalHigh: number;
  readonly totalUserOverride: number;
  readonly contingencyPercent: number;
  readonly completeness: BudgetCompletenessState;
}

export interface StageBudgetSummary {
  readonly stageKey: string;
  readonly stageName: string;
  readonly totalLow: number;
  readonly totalHigh: number;
  readonly totalUserOverride: number;
  readonly completeness: BudgetCompletenessState;
  readonly itemCount: number;
}

export type ApplicabilityState =
  | 'required'
  | 'likely-required'
  | 'maybe-required'
  | 'not-applicable'
  | 'unknown';

export type OfficialFormStatus =
  | 'not-started'
  | 'in-progress'
  | 'submitted'
  | 'completed'
  | 'not-applicable';

export type InvestorDocGroup =
  | 'official-forms'
  | 'project-design'
  | 'site-build'
  | 'energy-performance'
  | 'completion-package'
  | 'personal-notes';

export type InvestorDocStatus =
  | 'missing'
  | 'in-progress'
  | 'ready'
  | 'not-needed';

export type DecisionCategory =
  | 'technology'
  | 'structure'
  | 'energy'
  | 'finishing'
  | 'management'
  | 'other';

export type DecisionStatus =
  | 'open'
  | 'considering'
  | 'decided'
  | 'revisiting';

export type QuestionPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent';

export interface OfficialFormRecord {
  readonly id: string;
  readonly projectId: string;
  readonly formKey: string;
  readonly title: string;
  readonly explanation: string;
  readonly processPhase: string;
  readonly applicability: ApplicabilityState;
  readonly status: OfficialFormStatus;
  readonly plannedDate: string | null;
  readonly completedDate: string | null;
  readonly notes: string;
  readonly officialLink: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InvestorDocRecord {
  readonly id: string;
  readonly projectId: string;
  readonly group: InvestorDocGroup;
  readonly title: string;
  readonly description: string;
  readonly status: InvestorDocStatus;
  readonly stageKey: string | null;
  readonly fileRef: string | null;
  readonly notes: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BuildDecisionRecord {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly category: DecisionCategory;
  readonly stageKey: string | null;
  readonly status: DecisionStatus;
  readonly optionsConsidered: string;
  readonly selectedOption: string;
  readonly reasoning: string;
  readonly decisionDate: string | null;
  readonly followUpQuestions: string;
  readonly warningNote: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BuildQuestionRecord {
  readonly id: string;
  readonly projectId: string;
  readonly questionText: string;
  readonly stageKey: string | null;
  readonly targetRole: ProfessionalRole | string;
  readonly priority: QuestionPriority;
  readonly isAnswered: boolean;
  readonly answerText: string;
  readonly followUpNeeded: boolean;
  readonly linkedDecisionId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CompletionPackageItem {
  readonly id: string;
  readonly projectId: string;
  readonly itemKey: string;
  readonly title: string;
  readonly applicability: ApplicabilityState;
  readonly status: InvestorDocStatus;
  readonly notes: string;
  readonly createdAt: string;
}

export interface DocDashboardSummary {
  readonly officialPending: number;
  readonly officialCompleted: number;
  readonly decisionsUnresolved: number;
  readonly questionsOpen: number;
  readonly completionReady: number;
  readonly completionTotal: number;
  readonly highPriorityUnresolved: number;
}

export type UtilityConnectionStatus =
  | 'not-planned'
  | 'planning'
  | 'application-prepared'
  | 'conditions-received'
  | 'agreement-signed'
  | 'in-progress'
  | 'connected'
  | 'not-applicable';

export type GasPurpose =
  | 'heating'
  | 'cooking'
  | 'both'
  | 'not-planned';

export interface UtilityConnectionPlan {
  readonly id: string;
  readonly projectId: string;
  readonly utilityType: UtilityType;
  readonly status: UtilityConnectionStatus;
  readonly providerName: string;
  readonly connectionPower: string;
  readonly gasPurpose: GasPurpose;
  readonly temporarySupply: boolean;
  readonly alternativeNeeded: boolean;
  readonly applicationDate: string | null;
  readonly conditionsDate: string | null;
  readonly connectionDate: string | null;
  readonly notes: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UtilityChecklistItem {
  readonly id: string;
  readonly projectId: string;
  readonly utilityType: UtilityType;
  readonly itemKey: string;
  readonly title: string;
  readonly completed: boolean;
  readonly notes: string;
  readonly sortOrder: number;
  readonly createdAt: string;
}

export interface UtilityAlternative {
  readonly id: string;
  readonly projectId: string;
  readonly utilityType: UtilityType;
  readonly title: string;
  readonly description: string;
  readonly status: InvestorDocStatus;
  readonly notes: string;
  readonly createdAt: string;
}

export interface UtilityReadinessSummary {
  readonly electricityStatus: UtilityConnectionStatus;
  readonly waterStatus: UtilityConnectionStatus;
  readonly sewerStatus: UtilityConnectionStatus;
  readonly gasStatus: UtilityConnectionStatus;
  readonly internetStatus: UtilityConnectionStatus;
  readonly totalPlanned: number;
  readonly totalConnected: number;
  readonly blockedItems: number;
  readonly unresolvedDecisions: number;
}

export type PriceSourceType = 'market-planning' | 'regional-estimate' | 'operator-tariff-reference';

export type PriceCategory =
  | 'full-house'
  | 'example-case'
  | 'pre-build'
  | 'foundation'
  | 'structural-walls'
  | 'roof'
  | 'facade-insulation'
  | 'installations'
  | 'interior'
  | 'utility-connections';

export interface HouseBuildPriceReference {
  readonly id: string;
  readonly category: PriceCategory;
  readonly stageKey: string | null;
  readonly itemKey: string;
  readonly label: string;
  readonly unit: string;
  readonly priceMin: number;
  readonly priceMax: number;
  readonly baselinePrice: number;
  readonly currency: string;
  readonly regionCode: string;
  readonly regionLabel: string;
  readonly sourceName: string;
  readonly sourceType: PriceSourceType;
  readonly sourceUrl: string;
  readonly lastUpdated: string;
  readonly notes: string;
  readonly confidenceNote: string;
  readonly active: boolean;
}

export interface HouseBuildPriceOverride {
  readonly id: string;
  readonly projectId: string;
  readonly referenceId: string;
  readonly itemKey: string;
  readonly overrideMin: number | null;
  readonly overrideMax: number | null;
  readonly overrideBaseline: number | null;
  readonly label: string;
  readonly notes: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface HouseBuildCostAssumption {
  readonly id: string;
  readonly projectId: string;
  readonly assumptionKey: string;
  readonly label: string;
  readonly value: string;
  readonly notes: string;
  readonly createdAt: string;
}

export interface HouseBuildPriceSummary {
  readonly totalReferences: number;
  readonly totalOverrides: number;
  readonly categoryCounts: Record<PriceCategory, number>;
  readonly hasRegionalData: boolean;
  readonly lastUpdated: string;
}

export type AdminContentType =
  | 'stage-description'
  | 'formal-guidance'
  | 'utility-guidance'
  | 'decision-template'
  | 'question-template'
  | 'warning-note'
  | 'checklist-group'
  | 'completion-criteria'
  | 'milestone'
  | 'role-guidance';

export type AdminSourceType =
  | 'official'
  | 'technical'
  | 'operator'
  | 'market'
  | 'internal-guidance'
  | 'other';

export type AdminReliabilityLevel = 'high' | 'medium' | 'low';

export type AdminContentStatus = 'active' | 'inactive' | 'outdated' | 'review-soon';

export interface AdminContentItem {
  readonly id: string;
  readonly contentType: AdminContentType;
  readonly contentKey: string;
  readonly title: string;
  readonly summary: string;
  readonly body: string;
  readonly stageId: string;
  readonly category: string;
  readonly targetRole: string;
  readonly severity: string;
  readonly sourceId: string;
  readonly sourceText: string;
  readonly active: number;
  readonly lastReviewed: string;
  readonly lastUpdated: string;
  readonly createdAt: string;
  readonly notes: string;
}

export interface AdminSourceRegistryEntry {
  readonly id: string;
  readonly sourceName: string;
  readonly sourceType: AdminSourceType;
  readonly sourceUrl: string;
  readonly regionRelevance: string;
  readonly reliabilityLevel: AdminReliabilityLevel;
  readonly notes: string;
  readonly lastChecked: string;
  readonly active: number;
  readonly createdAt: string;
}

export interface AdminTrustDisclaimer {
  readonly id: string;
  readonly disclaimerKey: string;
  readonly text: string;
  readonly category: string;
  readonly active: number;
  readonly lastUpdated: string;
  readonly createdAt: string;
}

export interface AdminContentSnapshot {
  readonly id: string;
  readonly label: string;
  readonly notes: string;
  readonly createdAt: string;
  readonly snapshotData?: string;
  readonly stageCount: number;
  readonly formalCount: number;
  readonly utilitiesCount: number;
  readonly decisionCount: number;
  readonly questionCount: number;
  readonly warningCount: number;
  readonly active: number;
}

export interface AdminContentDashboardStats {
  readonly totalContentRecords: number;
  readonly totalChecklistGroups: number;
  readonly totalWarningNotes: number;
  readonly totalDecisionTemplates: number;
  readonly totalQuestionTemplates: number;
  readonly totalSourceRecords: number;
  readonly newestUpdate: string;
  readonly oldestUpdate: string;
  readonly missingSourceMetadata: number;
  readonly missingLastReviewed: number;
  readonly inactiveRecords: number;
  readonly outdatedRecords: number;
}

export interface AdminContentHealthIssue {
  readonly type: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
  readonly contentKey: string;
  readonly contentType: AdminContentType;
}

export type ContractorNeedStatus =
  | 'not-needed'
  | 'needed'
  | 'browsing'
  | 'request-prepared'
  | 'request-sent'
  | 'shortlisted'
  | 'selected'
  | 'unresolved';

export const CONTRACTOR_NEED_STATUS_LABELS: Record<ContractorNeedStatus, string> = {
  'not-needed': 'Niepotrzebny na tym etapie',
  'needed': 'Potrzebny wykonawca',
  'browsing': 'Przegladam oferty',
  'request-prepared': 'Zapytanie przygotowane',
  'request-sent': 'Zapytanie wyslane',
  'shortlisted': 'Na krotka liste',
  'selected': 'Wykonawca wybrany',
  'unresolved': 'Do rozwiazania',
};

export const CONTRACTOR_NEED_STATUS_COLORS: Record<ContractorNeedStatus, string> = {
  'not-needed': '#94A3B8',
  'needed': '#D97706',
  'browsing': '#2563EB',
  'request-prepared': '#7C3AED',
  'request-sent': '#0891B2',
  'shortlisted': '#059669',
  'selected': '#16A34A',
  'unresolved': '#DC2626',
};

export interface StageContractorNeed {
  readonly id: string;
  readonly projectId: string;
  readonly stageKey: string;
  readonly status: ContractorNeedStatus;
  readonly requestId: string | null;
  readonly selectedContractorId: string | null;
  readonly selectedContractorName: string | null;
  readonly notes: string;
  readonly updatedAt: string;
  readonly createdAt: string;
}

export interface StageContractorShortlistEntry {
  readonly id: string;
  readonly projectId: string;
  readonly stageKey: string;
  readonly contractorId: string;
  readonly contractorName: string;
  readonly note: string;
  readonly createdAt: string;
}

export interface StageContractorBoardRow {
  readonly stageKey: string;
  readonly stageName: string;
  readonly status: ContractorNeedStatus;
  readonly shortlistedCount: number;
  readonly requestCount: number;
  readonly selectedContractorName: string | null;
  readonly notes: string;
}

export interface StageRequestPreset {
  readonly stageKey: string;
  readonly templateText: string;
  readonly workCategory: string;
  readonly summaryPrefix: string;
}

export interface ContractorHiringQuestion {
  readonly stageKey: string;
  readonly question: string;
  readonly priority: 'high' | 'normal';
}

export interface ContractorSpecialtyAlias {
  readonly specialtyKey: string;
  readonly label: string;
  readonly categoryIds: readonly string[];
}

export interface StageContractorMappingExtended {
  readonly stageKey: string;
  readonly specialties: readonly string[];
  readonly label: string;
  readonly aliases: readonly ContractorSpecialtyAlias[];
  readonly requestPreset: StageRequestPreset;
  readonly hiringQuestions: readonly ContractorHiringQuestion[];
  readonly professionalGuidance: StageProfessionalGuidance;
}

export interface StageProfessionalGuidance {
  readonly stageKey: string;
  readonly commonRoles: readonly string[];
  readonly whenToStartLooking: string;
  readonly whenToCollectOffers: string;
  readonly whatToConfirm: string;
}
