import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, RowClickedEvent, RowClassRules } from "ag-grid-community";
import { Button } from "./ui/button"; // Adjust the path to your Button component

interface DataTableProps {
  rowData: any[];
  columnDefs: ColDef[];
  defaultColDef?: ColDef;
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  rowHeight?: number;
  onRowClicked?: (event: RowClickedEvent) => void;
  rowClassRules?: RowClassRules;
}

export function Table({
  rowData,
  columnDefs,
  defaultColDef,
  totalCount,
  page,
  totalPages,
  onPageChange,
  rowHeight = 60,
  onRowClicked,
  rowClassRules,
}: DataTableProps) {
  // Sensible defaults that can be overridden by the parent if needed
  const baseDefaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      ...defaultColDef,
    }),
    [defaultColDef],
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col w-full">
      {/* AG Grid */}
      <div className="w-full ag-theme-alpine" style={{ height: "auto" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={baseDefaultColDef}
          rowHeight={rowHeight}
          animateRows={true}
          domLayout="autoHeight"
          pagination={false}
          onRowClicked={onRowClicked}
          rowClassRules={rowClassRules}
          rowClass={onRowClicked ? "clickable-row" : undefined}
        />
      </div>

      {/* Custom Server-Side Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t mt-auto">
          <span className="text-sm text-muted-foreground">
            Total Records: {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
