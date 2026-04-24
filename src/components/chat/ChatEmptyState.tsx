import {
  BookOpen,
  Calendar,
  CheckSquare,
  Map as MapIcon,
  Sparkles,
} from 'lucide-react';

export function ChatEmptyState() {
  return (
    <div
      className="flex min-h-[60vh] w-full flex-1 flex-col items-center justify-center px-6 py-12 text-center"
      data-testid="chat-empty-state"
    >
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
        <Sparkles className="h-7 w-7" aria-hidden="true" strokeWidth={1.5} />
      </div>

      <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Side Quest Syndicate
      </h2>

      <p className="mb-10 max-w-md text-[15px] leading-relaxed text-gray-500">
        Your editorial assistant is ready. Define the brand voice, map content
        pillars, plan the first-week calendar, or configure the approval flow.
      </p>

      <div className="grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          className="flex items-start gap-3 rounded-xl border border-gray-150 bg-white p-4 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm"
        >
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <div>
            <div className="text-sm font-semibold text-gray-800">
              Define Brand Voice
            </div>
            <div className="mt-0.5 text-xs leading-relaxed text-gray-400">
              Set tone, audience, and editorial guidelines.
            </div>
          </div>
        </button>

        <button
          type="button"
          className="flex items-start gap-3 rounded-xl border border-gray-150 bg-white p-4 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm"
        >
          <MapIcon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <div>
            <div className="text-sm font-semibold text-gray-800">
              Map Content Pillars
            </div>
            <div className="mt-0.5 text-xs leading-relaxed text-gray-400">
              Identify core themes and recurring topics.
            </div>
          </div>
        </button>

        <button
          type="button"
          className="flex items-start gap-3 rounded-xl border border-gray-150 bg-white p-4 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm"
        >
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <div>
            <div className="text-sm font-semibold text-gray-800">
              Plan First Week
            </div>
            <div className="mt-0.5 text-xs leading-relaxed text-gray-400">
              Draft posts and schedule the rollout calendar.
            </div>
          </div>
        </button>

        <button
          type="button"
          className="flex items-start gap-3 rounded-xl border border-gray-150 bg-white p-4 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm"
        >
          <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <div>
            <div className="text-sm font-semibold text-gray-800">
              Review Approval Flow
            </div>
            <div className="mt-0.5 text-xs leading-relaxed text-gray-400">
              Configure review stages and sign-off rules.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
