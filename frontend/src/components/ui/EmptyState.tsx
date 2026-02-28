interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = "📭", title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
      <span className="mb-4 text-4xl">{icon}</span>
      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      {description && <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
      {action}
    </div>
  );
}
