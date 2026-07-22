export interface ClinicalSource {
  title: string;
  url: string;
  reviewedAt: string;
}

export interface ExamItem {
  sigtapCode: string;
  label: string;
  note?: string;
}

export interface ExamPreset {
  id: string;
  name: string;
  items: ExamItem[];
  source?: ClinicalSource;
  origin: 'seed' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface ExtensionStore {
  schemaVersion: 1;
  seedsInitialized: boolean;
  presets: ExamPreset[];
  allowedOrigins: string[];
}

export type ApplyStatus = 'added' | 'existing' | 'removed' | 'failed';

export interface ApplyResult {
  item: ExamItem;
  status: ApplyStatus;
  reason?: string;
}

export type RuntimeMessage =
  | { type: 'ACTIVATE_ORIGIN'; origin: string }
  | { type: 'REMOVE_ORIGIN'; origin: string }
  | { type: 'RECONCILE_ORIGINS' };
