import React from 'react'
import { cn } from '@/lib/utils'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Pause } from 'lucide-react'

type SurgeryStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED'

interface StatusBadgeProps {
  status: SurgeryStatus
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const statusConfig = {
  SCHEDULED: {
    label: 'Scheduled',
    icon: Calendar,
    className: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20',
    iconColor: 'text-blue-500'
  },
  IN_PROGRESS: {
    label: 'In Progress',
    icon: Clock,
    className: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20',
    iconColor: 'text-amber-500'
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20',
    iconColor: 'text-emerald-500'
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-50 text-red-700 border-red-200 ring-red-600/20',
    iconColor: 'text-red-500'
  },
  POSTPONED: {
    label: 'Postponed',
    icon: Pause,
    className: 'bg-gray-50 text-gray-700 border-gray-200 ring-gray-600/20',
    iconColor: 'text-gray-500'
  }
}

export function StatusBadge({ status, size = 'md', showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm', 
    lg: 'px-3 py-2 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium border rounded-full ring-1 ring-inset',
      sizes[size],
      config.className,
      className
    )}>
      {showIcon && <Icon className={cn(iconSizes[size], config.iconColor)} />}
      {config.label}
    </span>
  )
}

