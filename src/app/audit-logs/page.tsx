"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Pagination } from "@/components/ui/Pagination";
import { AppFooter } from "@/components/layout/Footer";
import {
  Shield,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Activity,
  Database,
  Clock,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userRole: string;
  userEmail: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  sessionId: string;
  additionalData?: string;
}

interface AuditLogResponse {
  auditLogs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summaryStats: Array<{ action: string; _count: { action: number } }>;
  failureStats: Array<{ success: boolean; _count: { _all: number } }>;
}

export default function AuditLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<
    AuditLogResponse["pagination"] | null
  >(null);
  const [summaryStats, setSummaryStats] = useState<
    AuditLogResponse["summaryStats"]
  >([]);
  const [failureStats, setFailureStats] = useState<
    AuditLogResponse["failureStats"]
  >([]);

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    action: "ALL",
    resource: "ALL",
    userId: "",
    success: "ALL",
    startDate: "",
    endDate: "",
  });

  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableResources, setAvailableResources] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }

    if ((session.user as { role: string }).role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch("/api/audit-logs", { method: "OPTIONS" });
        if (response.ok) {
          const data = await response.json();
          setAvailableActions(data.actions || []);
          setAvailableResources(data.resources || []);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    if ((session?.user as { role: string } | undefined)?.role === "ADMIN") {
      fetchFilterOptions();
    }
  }, [session]);

  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      if ((session?.user as { role: string } | undefined)?.role !== "ADMIN")
        return;

      setLoading(true);
      try {
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== "ALL") {
            searchParams.append(key, value.toString());
          }
        });

        const response = await fetch(`/api/audit-logs?${searchParams}`);
        if (response.ok) {
          const data: AuditLogResponse = await response.json();
          setAuditLogs(data.auditLogs);
          setPagination(data.pagination);
          setSummaryStats(data.summaryStats);
          setFailureStats(data.failureStats);
        } else {
          console.error("Failed to fetch audit logs");
        }
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [filters, session]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case "LOGIN":
      case "LOGOUT":
        return <User className="w-4 h-4" />;
      case "CREATE":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "READ":
      case "VIEW":
        return <Eye className="w-4 h-4 text-blue-600" />;
      case "UPDATE":
      case "EDIT":
        return <Activity className="w-4 h-4 text-orange-600" />;
      case "DELETE":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "EXPORT":
        return <Download className="w-4 h-4 text-purple-600" />;
      default:
        return <Database className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return "bg-green-100 text-green-800 border-green-200";
      case "READ":
      case "VIEW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "UPDATE":
      case "EDIT":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "DELETE":
        return "bg-red-100 text-red-800 border-red-200";
      case "EXPORT":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "LOGIN":
        return "bg-green-100 text-green-800 border-green-200";
      case "LOGOUT":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    });
  };

  const exportAuditLogs = async () => {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "ALL" && key !== "page" && key !== "limit") {
          searchParams.append(key, value.toString());
        }
      });
      searchParams.append("limit", "10000"); // Export more records

      const response = await fetch(`/api/audit-logs?${searchParams}`);
      if (response.ok) {
        const data: AuditLogResponse = await response.json();

        // Create CSV content
        const headers = [
          "Timestamp",
          "Action",
          "Resource",
          "Resource ID",
          "User ID",
          "User Role",
          "User Email",
          "IP Address",
          "Success",
          "Error Message",
          "Session ID",
        ];

        const csvContent = [
          headers.join(","),
          ...data.auditLogs.map((log) =>
            [
              `"${formatTimestamp(log.timestamp)}"`,
              log.action,
              log.resource,
              log.resourceId,
              log.userId,
              log.userRole,
              `"${log.userEmail}"`,
              log.ipAddress,
              log.success ? "SUCCESS" : "FAILURE",
              `"${log.errorMessage || ""}"`,
              log.sessionId,
            ].join(",")
          ),
        ].join("\n");

        // Download CSV file
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `audit-logs-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error exporting audit logs:", error);
    }
  };

  const generateTestData = async () => {
    try {
      const response = await fetch("/api/test-audit", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        // Refresh the audit logs
        setFilters((prev) => ({ ...prev, page: 1 }));
      } else {
        const error = await response.json();
        alert(`❌ Failed to generate test data: ${error.error}`);
      }
    } catch (error) {
      console.error("Error generating test data:", error);
      alert("❌ Failed to generate test data");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-sm text-gray-600">
                HIPAA-compliant activity monitoring and compliance tracking
              </p>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Events (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summaryStats.reduce(
                      (sum, stat) => sum + stat._count.action,
                      0
                    )}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {failureStats.length > 0
                      ? Math.round(
                          ((failureStats.find((s) => s.success)?._count
                            ._all || 0) /
                            failureStats.reduce(
                              (sum, s) => sum + s._count._all,
                              0
                            )) *
                            100
                        )
                      : 100}
                    %
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed Events</p>
                  <p className="text-2xl font-bold text-red-600">
                    {failureStats.find((s) => !s.success)?._count._all || 0}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Export Events</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summaryStats.find((s) => s.action.includes("EXPORT"))
                      ?._count.action || 0}
                  </p>
                </div>
                <Download className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  size="sm"
                  className={
                    showFilters
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : ""
                  }
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <Button
                  onClick={exportAuditLogs}
                  variant="outline"
                  size="sm"
                  className="text-purple-600 hover:bg-purple-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  onClick={generateTestData}
                  variant="outline"
                  size="sm"
                  className="text-green-600 hover:bg-green-50"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Generate Test Data
                </Button>
              </div>
            </div>
          </CardHeader>

          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action
                  </label>
                  <select
                    value={filters.action}
                    onChange={(e) =>
                      handleFilterChange("action", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Actions</option>
                    {availableActions.map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource
                  </label>
                  <select
                    value={filters.resource}
                    onChange={(e) =>
                      handleFilterChange("resource", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Resources</option>
                    {availableResources.map((resource) => (
                      <option key={resource} value={resource}>
                        {resource}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.success}
                    onChange={(e) =>
                      handleFilterChange("success", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All</option>
                    <option value="true">Success</option>
                    <option value="false">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <Input
                    type="text"
                    placeholder="Filter by user ID"
                    value={filters.userId}
                    onChange={(e) =>
                      handleFilterChange("userId", e.target.value)
                    }
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Audit Trail
                {pagination && (
                  <span className="text-sm font-normal text-gray-500">
                    ({pagination.totalCount.toLocaleString()} total records)
                  </span>
                )}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12">
                <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No audit logs found
                </h3>
                <p className="text-sm text-gray-500">
                  Try adjusting your filters to see more results.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {new Date(log.timestamp).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(
                                log.action
                              )}`}
                            >
                              {log.action}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.resource}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {log.resourceId.slice(-8)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.userEmail}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.userRole}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.success ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <XCircle className="w-3 h-3 mr-1" />
                              Failed
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <Button
                            onClick={() => setSelectedLog(log)}
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 mt-6">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.totalCount}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Audit Log Details
                  </h3>
                  <Button
                    onClick={() => setSelectedLog(null)}
                    variant="outline"
                    size="sm"
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Timestamp
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatTimestamp(selectedLog.timestamp)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Action
                      </label>
                      <div className="flex items-center gap-2">
                        {getActionIcon(selectedLog.action)}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(
                            selectedLog.action
                          )}`}
                        >
                          {selectedLog.action}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Resource
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.resource}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Resource ID
                      </label>
                      <p className="text-sm text-gray-900 font-mono">
                        {selectedLog.resourceId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        User Email
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.userEmail}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        User Role
                      </label>
                      <p className="text-sm text-gray-900">
                        {selectedLog.userRole}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        IP Address
                      </label>
                      <p className="text-sm text-gray-900 font-mono">
                        {selectedLog.ipAddress}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Session ID
                      </label>
                      <p className="text-sm text-gray-900 font-mono">
                        {selectedLog.sessionId.slice(-12)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1">
                      {selectedLog.success ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedLog.errorMessage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Error Message
                      </label>
                      <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          {selectedLog.errorMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      User Agent
                    </label>
                    <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-xs text-gray-700 font-mono break-all">
                        {selectedLog.userAgent}
                      </p>
                    </div>
                  </div>

                  {selectedLog.additionalData && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Data
                      </label>
                      <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(
                            JSON.parse(selectedLog.additionalData),
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}
