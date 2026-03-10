const DataTable = ({ columns, rows, emptyMessage = "No records found." }) => (
  <div className="glass rounded-2xl p-3">
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-electric/10 text-blue-100/70">
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-3 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row, idx) => (
              <tr key={row.id || idx} className="border-b border-white/5 text-slate-100 last:border-none">
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-blue-100/60">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default DataTable;
