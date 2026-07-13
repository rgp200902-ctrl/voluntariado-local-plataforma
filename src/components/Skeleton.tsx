interface SkeletonProps {
  className?: string;
  lines?: number;
  type?: 'text' | 'card' | 'avatar' | 'button' | 'image';
}

export function Skeleton({ className = '', lines = 3, type = 'text' }: SkeletonProps) {
  if (type === 'card') {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="skeleton h-6 w-3/4 mb-4" />
        <div className="skeleton h-4 w-1/2 mb-3" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-2/3 mb-4" />
        <div className="skeleton h-10 w-full rounded-md" />
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-4 w-1/3 mb-2" />
          <div className="skeleton h-3 w-1/4" />
        </div>
      </div>
    );
  }

  if (type === 'image') {
    return <div className={`skeleton w-full h-48 ${className}`} />;
  }

  if (type === 'button') {
    return <div className={`skeleton h-10 w-32 rounded-md ${className}`} />;
  }

  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton h-4 mb-2 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}
