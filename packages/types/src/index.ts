export const roles = ['USER', 'POLICE', 'COUNSELOR', 'LEGAL_ADVISOR', 'ADMIN'] as const;
export type Role = (typeof roles)[number];
export type Principal = {
  id: string;
  role: Role;
  name: string;
  verified: boolean;
  demo: boolean;
  jurisdiction?: string;
};
export type SafeUser = Principal & {
  locale: string;
  disguise: string;
  notificationsEnabled: boolean;
  locationDefault: boolean;
  biometricEnabled: boolean;
  hasPin: boolean;
};
export type Session = { accessToken: string; refreshToken: string; user: SafeUser };
export const roleHome: Record<Role, string> = {
  USER: '/home',
  ADMIN: '/admin',
  POLICE: '/police/live',
  COUNSELOR: '/counselor/sessions',
  LEGAL_ADVISOR: '/legal/queries',
};
export const categories = [
  'CYBER_HARASSMENT',
  'DOMESTIC_VIOLENCE',
  'WORKPLACE_HARASSMENT',
  'PUBLIC_TRANSPORT_ABUSE',
] as const;
export const stages = ['FILED', 'UNDER_INVESTIGATION', 'SUSPECT_CONTACTED', 'RESOLVED'] as const;
export type CaseStage = (typeof stages)[number];
export type CaseView = {
  id: string;
  reference: string;
  category: string;
  stage: CaseStage;
  triage: string;
  priority: string;
  anonymous: boolean;
  escalated: boolean;
  version: number;
  createdAt: string;
  demo: boolean;
  reporter: string;
  officer: { id: string; name: string } | null;
  narrative?: string;
  events?: {
    id: string;
    type: string;
    publicText: string;
    privateNote?: string;
    createdAt: string;
  }[];
  evidence?: EvidenceView[];
  analysis?: unknown[];
};
export type EvidenceView = {
  id: string;
  filename: string;
  mediaType: string;
  kind: string;
  size: number;
  sha256: string;
  capturedAt: string;
  sealedAt: string | null;
  locationTag: string | null;
  createdAt: string;
};
export type Position = {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
};
