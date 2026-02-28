import { LoadingSpinner } from "./LoadingSpinner";

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner className="h-10 w-10 text-primary-500" />
    </div>
  );
}
