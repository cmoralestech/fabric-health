"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Search, Filter, X, Calendar, Hash, Loader2 } from "lucide-react";

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SearchFilters {
  search: string;
  ageMin: string;
  ageMax: string;
  birthYear: string;
  birthDate: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface AdvancedPatientSearchProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
  totalResults?: number;
  onClearFilters?: () => void;
  currentFilters?: SearchFilters;
}

export default function AdvancedPatientSearch({
  onSearch,
  isLoading = false,
}: AdvancedPatientSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    ageMin: "",
    ageMax: "",
    birthYear: "",
    birthDate: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Debounce search input for performance
  const debouncedSearch = useDebounce(filters.search, 300);

  // Auto-search when debounced search changes
  useEffect(() => {
    setSearchLoading(true);
    onSearch(filters);
    setTimeout(() => setSearchLoading(false), 200); // Visual feedback
  }, [debouncedSearch, filters, onSearch]); // Only trigger when debounced search changes

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // For non-search filters, trigger search immediately
    if (key !== "search") {
      setSearchLoading(true);
      onSearch(newFilters);
      setTimeout(() => setSearchLoading(false), 200);
    }
  };

  const handleAdvancedSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      search: "",
      ageMin: "",
      ageMax: "",
      birthYear: "",
      birthDate: "",
      sortBy: "name",
      sortOrder: "asc",
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const hasActiveFilters =
    filters.ageMin ||
    filters.ageMax ||
    filters.birthYear ||
    filters.sortBy !== "name" ||
    filters.sortOrder !== "asc";

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Removed unused sortOptions

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
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 h-12 text-base border-2 focus:border-blue-500"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange("search", "")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={showAdvanced ? "primary" : "outline"}
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

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card className="border-gray-200 bg-gray-50/30">
          <CardContent className="p-4">
            {/* Compact filter grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              {/* Age Range - Compact */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Age Range
                </label>
                <div className="flex gap-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.ageMin}
                    onChange={(e) =>
                      handleFilterChange("ageMin", e.target.value)
                    }
                    className="h-8 text-sm flex-1"
                    min="0"
                    max="150"
                  />
                  <span className="text-xs text-gray-400 flex items-center">
                    to
                  </span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.ageMax}
                    onChange={(e) =>
                      handleFilterChange("ageMax", e.target.value)
                    }
                    className="h-8 text-sm flex-1"
                    min="0"
                    max="150"
                  />
                </div>
              </div>

              {/* Birth Year - Compact */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Birth Year
                </label>
                <select
                  value={filters.birthYear}
                  onChange={(e) =>
                    handleFilterChange("birthYear", e.target.value)
                  }
                  className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Any year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exact Date of Birth - Compact */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Exact Date of Birth
                </label>
                <Input
                  type="date"
                  value={filters.birthDate}
                  onChange={(e) =>
                    handleFilterChange("birthDate", e.target.value)
                  }
                  className="h-8 text-sm"
                />
              </div>

              {/* Actions - Compact */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Actions
                </label>
                <div className="flex gap-1">
                  <Button
                    onClick={handleAdvancedSearch}
                    className="h-8 px-3 text-sm flex-1"
                    isLoading={isLoading}
                  >
                    Search
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-8 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Filters - More compact */}
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Quick Filters:
              </p>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = {
                      ...filters,
                      ageMin: "0",
                      ageMax: "17",
                    };
                    setFilters(newFilters);
                    onSearch(newFilters);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Pediatric (0-17)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = {
                      ...filters,
                      ageMin: "18",
                      ageMax: "64",
                    };
                    setFilters(newFilters);
                    onSearch(newFilters);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Adult (18-64)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = { ...filters, ageMin: "65", ageMax: "" };
                    setFilters(newFilters);
                    onSearch(newFilters);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Senior (65+)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newFilters = {
                      ...filters,
                      sortBy: "createdAt",
                      sortOrder: "desc" as const,
                    };
                    setFilters(newFilters);
                    onSearch(newFilters);
                  }}
                  className="h-6 px-2 text-xs"
                >
                  Recently Added
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
