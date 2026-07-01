import { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  RowClickedEvent,
  RowClassRules,
  GridReadyEvent,
  GridSizeChangedEvent,
} from "ag-grid-community";
import { Button } from "./ui/button";
import { useSidebar } from "../../context/SidebarContext";

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
  const { sidebarOpen } = useSidebar();

  const baseDefaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
      ...defaultColDef,
    }),
    [defaultColDef],
  );

  // CHANGED: Dynamically size based on sidebar state
  const handleColumnSizing = useCallback(
    (params: GridReadyEvent | GridSizeChangedEvent) => {
      if (!params?.api) return;

      if (sidebarOpen) {
        // Auto-size columns to fit their content
        const allColumns = params.api.getColumns();
        if (allColumns) {
          const columnIds = allColumns.map((col) => col.getId());
          params.api.autoSizeColumns(columnIds);
        }
      } else {
        // Stretch columns to fill available grid width
        params.api.sizeColumnsToFit();
      }
    },
    [sidebarOpen], // Re-evaluates when sidebar toggles
  );

  const finalColumnDefs = useMemo(() => {
    const hasSrNoColumn = columnDefs.some((col) => {
      const field = col.field?.toLowerCase();
      const headerName = col.headerName?.toLowerCase();

      return (
        field === "srno" ||
        field === "serialno" ||
        field === "serialnumber" ||
        field === "sno" ||
        headerName === "sr no" ||
        headerName === "sr. no" ||
        headerName === "serial no" ||
        headerName === "s.no"
      );
    });

    if (hasSrNoColumn) return columnDefs;

    const srNoColumn: ColDef = {
      headerName: "Sr No.",
      width: 90,
      minWidth: 80,
      maxWidth: 100,
      sortable: false,
      filter: false,
      resizable: false,
      valueGetter: (params) => {
        return (page - 1) * rowData.length + (params?.node?.rowIndex ?? 0) + 1;
      },
    };

    return [srNoColumn, ...columnDefs];
  }, [columnDefs, page, rowData.length]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col w-full">
      <div className="w-full ag-theme-alpine" style={{ height: "auto" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={finalColumnDefs}
          defaultColDef={baseDefaultColDef}
          rowHeight={rowHeight}
          animateRows={true}
          domLayout="autoHeight"
          pagination={false}
          onRowClicked={onRowClicked}
          rowClassRules={rowClassRules}
          rowClass={onRowClicked ? "clickable-row" : undefined}
          // CHANGED: Attach dynamic sizing handler
          onGridReady={handleColumnSizing}
          onGridSizeChanged={handleColumnSizing}
        />
      </div>

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