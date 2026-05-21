import { createFileRoute } from '@tanstack/react-router'
import { Search, Eye, Ban, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute('/admin/userManagement')({
  component: UserManagement,
})

const users = [
  { name: "John Doe", phone: "+1 555-0101", registered: "Jan 5, 2026", alerts: 4, status: "Active" },
  { name: "Jane Smith", phone: "+1 555-0202", registered: "Feb 12, 2026", alerts: 2, status: "Active" },
  { name: "Bob Wilson", phone: "+1 555-0303", registered: "Mar 1, 2026", alerts: 0, status: "Active" },
  { name: "Alice Brown", phone: "+1 555-0404", registered: "Nov 18, 2025", alerts: 7, status: "Disabled" },
  { name: "Tom Davis", phone: "+1 555-0505", registered: "Dec 3, 2025", alerts: 1, status: "Active" },
  { name: "Maria Garcia", phone: "+1 555-0606", registered: "Jan 22, 2026", alerts: 3, status: "Active" },
];

export default function UserManagement() {
  return (
    <div>
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">User Management</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage registered users</p>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 w-72">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Name</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Phone</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Registered</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Alerts</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} className="border-b last:border-0 border-border hover:bg-secondary/30 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{u.name}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{u.phone}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{u.registered}</td>
                <td className="px-5 py-3 text-sm text-foreground font-medium">{u.alerts}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    u.status === "Active" ? "bg-safe-soft text-safe" : "bg-muted text-muted-foreground"
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded hover:bg-secondary transition-colors">
                      <Eye className="h-3.5 w-3.5 text-info" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-secondary transition-colors">
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-emergency-soft transition-colors">
                      <Ban className="h-3.5 w-3.5 text-emergency" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
);
};

