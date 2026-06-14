interface SkeletonProps {
  slow?: boolean;
}

// Loading placeholders for the trading floor. After five seconds a quiet note
// reassures that the feed is still on its way.
export default function Skeleton({ slow }: SkeletonProps) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass p-5" aria-hidden>
            <div className="mb-4 flex items-center justify-between">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-6 w-14" />
            </div>
            <div className="skeleton mb-3 h-10 w-28" />
            <div className="skeleton mb-5 h-14 w-full" />
            <div className="flex justify-between">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
      <p className="sr-only" role="status">
        Loading the market
      </p>
      {slow && (
        <p className="mt-6 text-center font-mono text-xs" style={{ color: 'var(--muted)' }}>
          The order book is taking a moment to settle. Hang tight, the feed is on its way.
        </p>
      )}
    </div>
  );
}
