import React from 'react'
import { Users, UserCheck, UserPlus, ShieldBan } from "lucide-react";
import StatCard from '@/components/user-stat-cards';
import UsersTable from '@/components/user-table';
import { mockUsers } from '@/data/mockUsers';
import UserCharts from '@/components/charts/admin-charts/users-page-charts';

const stats = [
  { title: "Total Users", value: 10, icon: Users, trend: "+12% from last month", trendUp: true },
  { title: "Active Users", value: 20, icon: UserCheck, trend: "92% of total", trendUp: true },
  { title: "New This Month", value: 2, icon: UserPlus, trend: "+1 vs last month", trendUp: true },
  { title: "Suspended", value:6, icon: ShieldBan, trend: "2 accounts", trendUp: false },
];
function UsersPage() {
  return (
     <main className="mx-auto max-w-7xl space-y-6 px-6 py-6 pt-0">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.title} {...s} />
          ))}
        </div>
        <div className="w-full">
           <UserCharts users={mockUsers} />
        </div>
        {/* Users Table */}
        <UsersTable users={mockUsers}  />
      </main>
  )
}

export default UsersPage
