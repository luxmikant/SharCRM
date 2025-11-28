import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface SkeletonCardProps {
  lines?: number
  hasHeader?: boolean
  hasImage?: boolean
}

export function SkeletonCard({ lines = 3, hasHeader = true, hasImage = false }: SkeletonCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      {hasImage && <Skeleton height={200} className="rounded-xl" />}
      {hasHeader && (
        <div className="flex items-center gap-4">
          <Skeleton circle width={48} height={48} />
          <div className="flex-1">
            <Skeleton width="60%" height={20} />
            <Skeleton width="40%" height={16} className="mt-2" />
          </div>
        </div>
      )}
      <Skeleton count={lines} />
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-100 p-4">
        <Skeleton width="30%" height={24} />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="flex-1">
                <Skeleton height={20} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
          <Skeleton width="50%" height={16} />
          <Skeleton width="70%" height={32} className="mt-2" />
          <Skeleton width="40%" height={16} className="mt-4" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton width={200} height={24} />
        <Skeleton width={100} height={32} />
      </div>
      <Skeleton height={300} className="rounded-xl" />
    </div>
  )
}

// Aliases for backward compatibility
export const ChartSkeleton = SkeletonChart
export const TableSkeleton = SkeletonTable
export const StatsSkeleton = SkeletonStats
export const CardSkeleton = SkeletonCard

export { Skeleton }
export default Skeleton
