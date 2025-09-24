'use client'

import { Button } from './Button'
import { Grid3X3, List } from 'lucide-react'

interface ViewToggleProps {
  view: 'cards' | 'table'
  onViewChange: (view: 'cards' | 'table') => void
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <Button
        variant={view === 'cards' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('cards')}
        className={`px-3 py-1.5 text-xs ${
          view === 'cards' 
            ? 'bg-white shadow-sm text-gray-900' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Grid3X3 className="w-4 h-4 mr-1" />
        Cards
      </Button>
      <Button
        variant={view === 'table' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className={`px-3 py-1.5 text-xs ${
          view === 'table' 
            ? 'bg-white shadow-sm text-gray-900' 
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <List className="w-4 h-4 mr-1" />
        Table
      </Button>
    </div>
  )
}