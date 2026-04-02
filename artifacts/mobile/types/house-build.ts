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
