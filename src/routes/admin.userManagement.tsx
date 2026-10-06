/* eslint-disable prettier/prettier */

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Eye,
  Ban,
  Pencil,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getAdminUsers,
  setAdminUserDisabled,
  type AdminUser,
} from "@/services/adminService";

export const Route = createFileRoute("/admin/userManagement")({
  component: UserManagement,
});

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(
    null,
  );

  /*
   * =========================================================
   * Load users
   * =========================================================
   */

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminUsers();

        setUsers(data);
      } catch (err) {
        console.error("Failed to load admin users:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load users.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  /*
   * =========================================================
   * Disable / Enable user
   * =========================================================
   */

  async function handleToggleAccount(user: AdminUser) {
    const newDisabledState = !user.accountDisabled;

    const action = newDisabledState ? "disable" : "enable";

    const confirmed = window.confirm(
      newDisabledState
        ? `Are you sure you want to disable ${user.name}'s account?`
        : `Are you sure you want to enable ${user.name}'s account?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(user.userId);
      setError(null);

      await setAdminUserDisabled(
        user.userId,
        newDisabledState,
      );

      /*
       * Update the local table immediately instead of
       * fetching all users again.
       */

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.userId === user.userId
            ? {
                ...currentUser,
                accountDisabled: newDisabledState,
              }
            : currentUser,
        ),
      );
    } catch (err) {
      console.error(
        `Failed to ${action} user:`,
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${action} user.`,
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  /*
   * =========================================================
   * Search
   * =========================================================
   */

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase().trim();

    return (
      user.name.toLowerCase().includes(search) ||
      user.phone.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  /*
   * =========================================================
   * Render
   * =========================================================
   */

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          User Management
        </h1>

        <p className="text-sm text-muted-foreground mb-6">
          Manage registered users
        </p>

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 w-72">
            <Search className="h-4 w-4 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="
                bg-transparent
                text-sm
                text-foreground
                placeholder:text-muted-foreground
                outline-none
                w-full
              "
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-emergency-soft text-emergency border border-border rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Users table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              {searchTerm
                ? "No users match your search."
                : "No registered users found."}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Name
                  </th>

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Phone
                  </th>

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Registered
                  </th>

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Alerts
                  </th>

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Setup
                  </th>

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Account Status
                  </th>

                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const isUpdating =
                    updatingUserId === user.userId;

                  return (
                    <tr
                      key={user.userId}
                      className="
                        border-b last:border-0 border-border
                        hover:bg-secondary/30
                        transition-colors
                      "
                    >
                      {/* Name */}
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium text-foreground">
                          {user.name}
                        </div>

                        <div className="text-xs text-muted-foreground mt-0.5">
                          {user.email}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {user.phone}
                      </td>

                      {/* Registered */}
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {user.registered}
                      </td>

                      {/* Alerts */}
                      <td className="px-5 py-3 text-sm text-foreground font-medium">
                        {user.alerts}
                      </td>

                      {/* Setup */}
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            user.setupCompleted
                              ? "bg-safe-soft text-safe"
                              : "bg-warning-soft text-warning"
                          }`}
                        >
                          {user.setupCompleted
                            ? "Completed"
                            : "Incomplete"}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            user.accountDisabled
                              ? "bg-muted text-muted-foreground"
                              : "bg-safe-soft text-safe"
                          }`}
                        >
                          {user.accountDisabled
                            ? "Disabled"
                            : "Active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {/* View */}
                          <Link
                            to="/admin/userManagement/$userId/view"
                            params={{
                              userId: user.userId,
                            }}
                            title="View user"
                            className="
                              p-1.5 rounded
                              hover:bg-secondary
                              transition-colors
                            "
                          >
                            <Eye className="h-3.5 w-3.5 text-info" />
                          </Link>

                          {/* Edit */}
                          <Link
                            to="/admin/userManagement/$userId/edit"
                            params={{
                              userId: user.userId,
                            }}
                            title="Edit user"
                            className="
                              p-1.5 rounded
                              hover:bg-secondary
                              transition-colors
                            "
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </Link>

                          {/* Disable / Enable */}
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleAccount(user)
                            }
                            disabled={isUpdating}
                            title={
                              user.accountDisabled
                                ? "Enable user"
                                : "Disable user"
                            }
                            className={`
                              p-1.5 rounded
                              hover:bg-secondary
                              transition-colors
                              disabled:opacity-50
                              disabled:cursor-not-allowed
                            `}
                          >
                            {user.accountDisabled ? (
                              <CheckCircle className="h-3.5 w-3.5 text-safe" />
                            ) : (
                              <Ban className="h-3.5 w-3.5 text-emergency" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}