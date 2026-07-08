import UserRow from "./UserRow";

const COLUMNS = ["User", "Role", "Email", "Phone", "Location", "Joined On", "Verification", "Status", "Actions"];

export default function UsersTable({ users }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-line bg-surface/60 text-xs font-semibold uppercase tracking-wide text-muted">
            {COLUMNS.map((col) => (
              <th key={col} className="whitespace-nowrap px-3 py-3 first:pl-4 last:pr-4 last:text-right">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="py-10 text-center text-sm text-muted">
                No users match these filters.
              </td>
            </tr>
          ) : (
            users.map((user) => <UserRow key={user.id} user={user} />)
          )}
        </tbody>
      </table>
    </div>
  );
}
