import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';

export function ListState({
  loading,
  error,
  onRetry,
  title,
  message,
  actionLabel,
  onAction,
  icon,
}) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  return (
    <EmptyState
      title={title}
      message={message}
      actionLabel={actionLabel}
      onAction={onAction}
      icon={icon}
    />
  );
}
