'use client';

import { useTransition } from 'react';
import { switchRole } from '@/lib/auth/actions';
import type { Role } from '@/lib/auth/types';

export function RoleSwitcher({ currentRole }: { currentRole: Role }) {
  const [isPending, startTransition] = useTransition();

  const handleRoleSwitch = (role: Role) => {
    startTransition(() => {
      switchRole(role);
    });
  };

  const roles: Role[] = ['Creator', 'Editor', 'Admin'];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <div className="rounded-lg border border-gray-200 bg-white p-1.5 shadow-sm">
        <div className="flex gap-1">
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSwitch(role)}
              disabled={isPending}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentRole === role
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } ${isPending ? 'opacity-50' : ''}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
