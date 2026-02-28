interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
      <span className="mb-4 text-4xl">⚠️</span>
      <p className="mb-6 text-gray-700 dark:text-gray-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          Try again
        </button>
      )}
    </div>
  );
}
