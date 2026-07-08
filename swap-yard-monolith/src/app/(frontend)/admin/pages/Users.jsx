import { useMemo, useState } from "react";
import UsersFilters from "../components/users/UsersFilters";
import UsersTable from "../components/users/UsersTable";
import Pagination from "../components/common/Pagination";
import { generateUsers, totalUsersCount } from "../data/mockData";

const PAGE_SIZE = 5;

// In a real app this would be a server-paginated/filtered query. Kept as a
// pure function here so it's trivial to swap for an API call later.
function useFilteredUsers(filters, page) {
  return useMemo(() => {
    const pageUsers = generateUsers(page, PAGE_SIZE);
    return pageUsers.filter((u) => {
      if (filters.role !== "All Roles" && u.role !== filters.role) return false;
      if (filters.status !== "All Status" && u.status !== filters.status) return false;
      if (filters.verification !== "All" && u.verification !== filters.verification) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.phone.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [filters, page]);
}

export default function Users() {
  const [filters, setFilters] = useState({ search: "", role: "All Roles", status: "All Status", verification: "All" });
  const [page, setPage] = useState(1);

  const users = useFilteredUsers(filters, page);
  const totalPages = Math.ceil(totalUsersCount / PAGE_SIZE);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function handleExport() {
    alert("Exporting current view (demo only)");
  }

  return (
    <div className="flex flex-col gap-4 pt-1">
      <UsersFilters filters={filters} onFilterChange={handleFilterChange} onExport={handleExport} />
      <div className="rounded-2xl">
        <UsersTable users={users} />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={totalUsersCount}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
