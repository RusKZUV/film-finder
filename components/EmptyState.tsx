"use client";

interface EmptyStateProps {
  query?: string;
}

export default function EmptyState({ query }: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 py-16 text-gray-600 dark:text-gray-400"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-gray-300 dark:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          No results found
          {query ? ` for "${query}"` : ""}
        </p>
        <p className="mt-1 text-sm">
          Try broadening your filters, adjusting the year range, or using different keywords.
        </p>
      </div>
    </div>
  );
}
