export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-block h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
    />
  );
}
