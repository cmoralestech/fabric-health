'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Search, Filter, X, Calendar, Hash, SortAsc, SortDesc, Loader2 } from 'lucide-react'

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface SearchFilters {
  search: string
  ageMin: string
  ageMax: string
  birthYear: string
  birthDate: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface AdvancedPatientSearchProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
  totalResults?: number
}

export default function AdvancedPatientSearch({ 
  onSearch, 
  isLoading = false, 
  totalResults = 0 
}: AdvancedPatientSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    ageMin: '',
    ageMax: '',
    birthYear: '',
    birthDate: '',
    sortBy: 'name',
    sortOrder: 'asc'
  })
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  
  // Debounce search input for performance
  const debouncedSearch = useDebounce(filters.search, 300)

  // Auto-search when debounced search changes
  useEffect(() => {
    setSearchLoading(true)
    onSearch(filters)
    setTimeout(() => setSearchLoading(false), 200) // Visual feedback
  }, [debouncedSearch]) // Only trigger when debounced search changes

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // For non-search filters, trigger search immediately
    if (key !== 'search') {
      setSearchLoading(true)
      onSearch(newFilters)
      setTimeout(() => setSearchLoading(false), 200)
    }
  }

  const handleAdvancedSearch = () => {
    onSearch(filters)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      search: '',
      ageMin: '',
      ageMax: '',
      birthYear: '',
      birthDate: '',
      sortBy: 'name',
      sortOrder: 'asc'
    }
    setFilters(clearedFilters)
    onSearch(clearedFilters)
  }

  const hasActiveFilters = filters.ageMin || filters.ageMax || filters.birthYear || filters.sortBy !== 'name' || filters.sortOrder !== 'asc'

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i)

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'age', label: 'Age' },
    { value: 'birthDate', label: 'Birth Date' },
    { value: 'createdAt', label: 'Date Added' }
  ]

  return (
    <div className="space-y-4">
      {/* Main Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          {searchLoading ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          )}
          <Input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 h-12 text-base border-2 focus:border-blue-500"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={showAdvanced ? 'primary' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="h-12 px-4"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>
            {isLoading ? 'Searching...' : `${totalResults} patients found`}
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-3 h-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
        
        {/* Quick Sort */}
        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1"
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Age Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Age Range
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.ageMin}
                    onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                    className="flex-1"
                    min="0"
                    max="150"
                  />
                  <span className="flex items-center text-gray-500">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.ageMax}
                    onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                    className="flex-1"
                    min="0"
                    max="150"
                  />
                </div>
              </div>

              {/* Birth Year */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Birth Year
                </label>
                <select
                  value={filters.birthYear}
                  onChange={(e) => handleFilterChange('birthYear', e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Any year</option>
                  {yearOptions.map(year => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Second row for DOB search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exact Date of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Exact Date of Birth
                </label>
                <Input
                  type="date"
                  value={filters.birthDate}
                  onChange={(e) => handleFilterChange('birthDate', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Search Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Actions
                </label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAdvancedSearch}
                    className="flex-1"
                    isLoading={isLoading}
                  >
                    Search
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="px-3"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Common Search Shortcuts */}
            <div className="border-t border-blue-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Filters:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = { ...filters, ageMin: '0', ageMax: '17' }
                    setFilters(newFilters)
                    onSearch(newFilters)
                  }}
                  className="text-xs"
                >
                  Pediatric (0-17)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = { ...filters, ageMin: '18', ageMax: '64' }
                    setFilters(newFilters)
                    onSearch(newFilters)
                  }}
                  className="text-xs"
                >
                  Adult (18-64)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = { ...filters, ageMin: '65', ageMax: '' }
                    setFilters(newFilters)
                    onSearch(newFilters)
                  }}
                  className="text-xs"
                >
                  Senior (65+)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = { ...filters, sortBy: 'createdAt', sortOrder: 'desc' as const }
                    setFilters(newFilters)
                    onSearch(newFilters)
                  }}
                  className="text-xs"
                >
                  Recently Added
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
