"use client";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Something went wrong while fetching results. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center justify-center gap-4 py-16 text-gray-600 dark:text-gray-400"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-red-400 dark:text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Search failed
        </p>
        <p className="mt-1 text-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 px-6 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          aria-label="Retry search"
        >
          Retry
        </button>
      )}
    </div>
  );
}
