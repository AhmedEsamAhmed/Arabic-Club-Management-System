import clsx from 'clsx';

const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-indigo-100 text-indigo-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
};

const statusVariants = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'danger',
  approved: 'success',
  rejected: 'danger',
};

export default function Badge({ children, variant = 'default', status, className = '' }) {
  const resolvedVariant = status ? (statusVariants[status] || 'default') : variant;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[resolvedVariant],
        className
      )}
    >
      {children}
    </span>
  );
}
