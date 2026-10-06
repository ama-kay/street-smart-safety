import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Filter, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getAdminEmergencyLogs, type AdminEmergencyLog } from "@/services/adminService";

export const Route = createFileRoute("/admin/emergencyLogs")({
  component: AdminEmergencyLogs,
});

const statusStyles: Record<string, string> = {
  Pending: "bg-warning-soft text-warning",
  Active: "bg-emergency-soft text-emergency",
  Sent: "bg-emergency-soft text-emergency",
  Resolved: "bg-safe-soft text-safe",
  Cancelled: "bg-muted text-muted-foreground",
};

export default function AdminEmergencyLogs() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AdminEmergencyLog[]>([]);
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All time");

  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminEmergencyLogs();

        setLogs(data);
      } catch (err) {
        console.error("Failed to load emergency logs:", err);

        setError(err instanceof Error ? err.message : "Failed to load emergency logs.");
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  /*
   * -------------------------------------------------------
   * Search + Filters
   * -------------------------------------------------------
   */

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = new Date();

    return logs.filter((log) => {
      /*
       * Search
       */
      const matchesSearch =
        !query ||
        log.user.toLowerCase().includes(query) ||
        log.location.toLowerCase().includes(query) ||
        log.status.toLowerCase().includes(query) ||
        log.id.toLowerCase().includes(query);

      /*
       * Status filter
       */
      const matchesStatus = statusFilter === "All" || log.status === statusFilter;

      /*
       * Date filter
       */
      let matchesDate = true;

      if (dateFilter !== "All time") {
        const logDate = new Date(log.timestamp);

        if (dateFilter === "Today") {
          matchesDate =
            logDate.getFullYear() === now.getFullYear() &&
            logDate.getMonth() === now.getMonth() &&
            logDate.getDate() === now.getDate();
        }

        if (dateFilter === "Last 7 days") {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);

          matchesDate = logDate >= sevenDaysAgo && logDate <= now;
        }

        if (dateFilter === "Last 30 days") {
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);

          matchesDate = logDate >= thirtyDaysAgo && logDate <= now;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [logs, search, statusFilter, dateFilter]);

  /*
   * -------------------------------------------------------
   * Pagination
   * -------------------------------------------------------
   */

  const totalLogs = filteredLogs.length;

  const isShowingAll = rowsPerPage === "all";

  const pageSize = isShowingAll ? totalLogs || 1 : Number(rowsPerPage);

  const totalPages = isShowingAll ? 1 : Math.max(1, Math.ceil(totalLogs / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter, rowsPerPage]);

  const paginatedLogs = useMemo(() => {
    if (isShowingAll) {
      return filteredLogs;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage, pageSize, isShowingAll]);

  const startItem = totalLogs === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endItem = isShowingAll ? totalLogs : Math.min(currentPage * pageSize, totalLogs);

  /*
   * -------------------------------------------------------
   * Clear filters
   * -------------------------------------------------------
   */

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("All time");
  }

  return (
    <div>
      <div>
        {/* Header */}
        <h1 className="text-2xl font-bold text-foreground mb-1">Emergency Logs</h1>

        <p className="text-sm text-muted-foreground mb-6">Full alert history</p>

        {/* Search + Filters */}
        <div className="flex items-center gap-3 mb-4">
          {/* Search */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 w-72">
            <Search className="h-4 w-4 text-muted-foreground" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search logs..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="px-3 py-2 text-sm text-foreground bg-card border border-border rounded-lg outline-none cursor-pointer"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Sent">Sent</option>
            <option value="Resolved">Resolved</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Date */}
          <select
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="px-3 py-2 text-sm text-foreground bg-card border border-border rounded-lg outline-none cursor-pointer"
          >
            <option value="All time">All time</option>
            <option value="Today">Today</option>
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
          </select>

          {/* Filter indicator */}
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-card border border-border rounded-lg">
            <Filter className="h-4 w-4" />
            Filters
          </div>

          {/* Clear */}
          {(search.trim() !== "" || statusFilter !== "All" || dateFilter !== "All time") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-info hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-emergency-soft text-emergency border border-border rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Loading emergency logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                {search.trim() || statusFilter !== "All" || dateFilter !== "All time"
                  ? "No matching emergency logs"
                  : "No emergency logs"}
              </p>

              <p className="text-sm text-muted-foreground mt-1">
                {search.trim() || statusFilter !== "All" || dateFilter !== "All time"
                  ? "Try changing your search or filters."
                  : "There are currently no emergency alerts in the system."}
              </p>

              {(search.trim() || statusFilter !== "All" || dateFilter !== "All time") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 text-sm text-info hover:underline"
                >
                  Clear search and filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                      Alert ID
                    </th>

                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                      User
                    </th>

                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                      Timestamp
                    </th>

                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                      Location
                    </th>

                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                      Status
                    </th>

                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                      Contacts Notified
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() =>
                        navigate({
                          to: "/admin/emergencyLogs/$alertId",
                          params: {
                            alertId: log.id,
                          },
                        })
                      }
                      className="border-b last:border-0 border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      {/* Alert ID */}
                      <td className="px-5 py-3 text-sm text-info font-mono">{log.id}</td>

                      {/* User */}
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{log.user}</td>

                      {/* Timestamp */}
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {formatEmergencyTime(log.timestamp)}
                      </td>

                      {/* Location */}
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span>{log.location}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            statusStyles[log.status] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      {/* Contacts */}
                      <td className="px-5 py-3 text-sm text-foreground">{log.contactsNotified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
                  <span className="font-medium text-foreground">{endItem}</span> of{" "}
                  <span className="font-medium text-foreground">{totalLogs}</span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Rows per page */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Show</span>

                    <select
                      value={rowsPerPage}
                      onChange={(event) => setRowsPerPage(event.target.value)}
                      className="px-2 py-1.5 text-sm text-foreground bg-card border border-border rounded-md outline-none cursor-pointer"
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="all">All</option>
                    </select>

                    <span>per page</span>
                  </div>

                  {/* Previous */}
                  <button
                    type="button"
                    disabled={currentPage === 1 || isShowingAll}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    className="px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page */}
                  {!isShowingAll && (
                    <span className="text-sm text-muted-foreground">
                      Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
                      <span className="font-medium text-foreground">{totalPages}</span>
                    </span>
                  )}

                  {/* Next */}
                  <button
                    type="button"
                    disabled={currentPage === totalPages || isShowingAll}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    className="px-3 py-1.5 text-sm border border-border rounded-md text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * Format emergency time
 * =========================================================
 */

function formatEmergencyTime(dateString: string): string {
  const date = new Date(dateString);

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
