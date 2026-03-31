import type { ActivityAction, PhotoType, ProjectStatus } from '@/types/domain';

export const ACTIVITY_ICONS: Record<ActivityAction, string> = {
  created: 'plus-circle',
  status_changed: 'refresh-cw',
  checklist_completed: 'check-square',
  photo_added: 'camera',
  shopping_generated: 'shopping-cart',
  note_updated: 'edit-3',
  edited: 'edit',
};

export const PHOTO_TYPE_LABELS: Record<PhotoType, string> = {
  before: 'Przed',
  during: 'W trakcie',
  after: 'Po',
};

export const PHOTO_TYPE_COLORS: Record<PhotoType, { color: string; bg: string }> = {
  before: { color: '#3B82F6', bg: '#EFF6FF' },
  during: { color: '#F59E0B', bg: '#FFFBEB' },
  after: { color: '#22C55E', bg: '#F0FDF4' },
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planowanie',
  'in-progress': 'W trakcie',
  completed: 'Ukończony',
};

export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'przed chwilą';
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h temu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'wczoraj';
  return `${days} dni temu`;
}

export function timeAgoShort(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'teraz';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function formatDuration(minutes: number): string {
  return minutes >= 60
    ? `${Math.round(minutes / 60)}h`
    : `${minutes}min`;
}

export function pluralize(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one;
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
