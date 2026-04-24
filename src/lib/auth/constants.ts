import type { Role } from './types';

export interface DemoUser {
  id: string;
  email: string;
  role: Role;
  display_name: string;
}

/**
 * Stable demo user definitions. Intentionally no Node.js imports —
 * this file must remain safe for the Edge Runtime (middleware).
 */
export const DEMO_USERS: DemoUser[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'creator@contentops.local',
    role: 'Creator',
    display_name: 'Syndicate Creator',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'editor@contentops.local',
    role: 'Editor',
    display_name: 'Syndicate Editor',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'admin@contentops.local',
    role: 'Admin',
    display_name: 'Syndicate Admin',
  },
];
