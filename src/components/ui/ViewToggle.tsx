'use client'

import { Grid, List } from 'lucide-react'

interface ViewToggleProps {
  view: 'card' | 'table'
  onViewChange: (view: 'card' | 'table') => void
  className?: string
}

export default function ViewToggle({ view, onViewChange, className = '' }: ViewToggleProps) {
  return (
    <div className={`inline-flex rounded-lg border border-gray-200 bg-white p-1 ${className}`}>
      <button
        onClick={() => onViewChange('card')}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          view === 'card'
            ? 'bg-blue-100 text-blue-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Grid className="w-4 h-4" />
        Cards
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          view === 'table'
            ? 'bg-blue-100 text-blue-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
      >
        <List className="w-4 h-4" />
        Table
      </button>
    </div>
  )
}
