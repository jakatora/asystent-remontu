// ─── User entity types ────────────────────────────────────────────────────────

// ─── Room ──────────────────────────────────────────────────────────────────────

export type RoomType =
  | 'bedroom'
  | 'living-room'
  | 'kitchen'
  | 'bathroom'
  | 'toilet'
  | 'hallway'
  | 'balcony'
  | 'garage'
  | 'other';

export interface Room {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly type: RoomType;
  readonly lengthM: number;
  readonly widthM: number;
  readonly heightM?: number;
  readonly floorAreaM2?: number;
  readonly wallAreaM2?: number;
  readonly ceilingAreaM2?: number;
  /** Number of windows in this room. */
  readonly windowCount?: number;
  /** Number of doors in this room. */
  readonly doorCount?: number;
  readonly notes?: string;
  readonly createdAt: string;
}

// ─── User preference ──────────────────────────────────────────────────────────

export type ExperienceLevel = 'beginner' | 'intermediate' | 'experienced';
export type PreferredUnit = 'metric';

export interface UserPreference {
  readonly id: string;
  readonly experienceLevel: ExperienceLevel;
  readonly showBeginnersHints: boolean;
  readonly showWarningsExpanded: boolean;
  readonly defaultWastePct: number;
  readonly preferredUnit: PreferredUnit;
  readonly currency: 'PLN';
  /** IDs of jobs the user has bookmarked. */
  readonly bookmarkedJobIds: readonly string[];
  /** Whether to show cost estimates with labor included. */
  readonly includeLabor: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const DEFAULT_USER_PREFERENCES: Omit<UserPreference, 'id' | 'createdAt' | 'updatedAt'> = {
  experienceLevel:      'beginner',
  showBeginnersHints:   true,
  showWarningsExpanded: true,
  defaultWastePct:      10,
  preferredUnit:        'metric',
  currency:             'PLN',
  bookmarkedJobIds:     [],
  includeLabor:         false,
};

// ─── Saved calculation ────────────────────────────────────────────────────────

/**
 * A user-saved snapshot of a calculation — allows comparing different
 * measurement inputs or material configurations for the same job.
 */
export interface SavedCalculation {
  readonly id: string;
  readonly projectId: string;
  readonly jobId: string;
  readonly label: string;
  readonly measurements: Record<string, number>;
  readonly totalMaterialsCost: number;
  readonly totalBudgetMin: number;
  readonly totalBudgetMax: number;
  readonly currency: 'PLN';
  readonly materialCount: number;
  readonly createdAt: string;
}
