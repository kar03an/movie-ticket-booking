"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import type { Seat, Theatre } from "@movie-ticket-booking/shared/types";
import { cn } from "@/lib/utils";
import ErrorComponent from "@/components/error";
import { useTheatre } from "@/hooks/query/useTheatre";
import { useTheatreSeatsLayout } from "@/hooks/query/useTheatreSeatsLayout";
import { useTheatreSeatsLayoutMtn } from "@/hooks/mutation/useTheatreSeatsLayoutMtn";
import TheatreScreen from "@/components/theatre-screen";

export type SeatStatus = "available" | "unavailable";
export type SeatStatusMap = Map<string, SeatStatus>;
export type TheatreSeat = Pick<Seat, "row" | "col"> & { status: SeatStatus };

/** Spreadsheet-style row naming: A, B, ... Z, AA, AB, ... */
function nextRowLabel(rows: string[]): string {
  if (rows.length === 0) return "A";
  const last = rows[rows.length - 1];
  const chars = last.split("");
  let i = chars.length - 1;
  while (i >= 0) {
    if (chars[i] === "Z") {
      chars[i] = "A";
      i--;
    } else {
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
      return chars.join("");
    }
  }
  return "A" + chars.join("");
}

function seatKey(row: string, col: number) {
  return `${row}::${col}`;
}

function ManageSeatsPage() {
  const session = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Locally-editable layout state, seeded from the server data.
  const [rows, setRows] = useState<string[]>([]);
  const [maxCols, setMaxCols] = useState(0);
  const [seatStatus, setSeatStatus] = useState<SeatStatusMap>(new Map());
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!session) {
      router.replace("/auth" as Route);
    }
  }, [session, router]);

  const theatreQuery = useTheatre(session);
  const seatsQuery = useTheatreSeatsLayout(theatreQuery.data?.id);

  // Build the full grid (rows x cols) from the seats the API returned, filling
  // any gap in between with "unavailable". Runs on initial load and again after
  // a successful save invalidates the query.
  useEffect(() => {
    if (!seatsQuery.data) return;
    const rowLabels = Array.from(new Set(seatsQuery.data.map((s) => s.row))).sort();
    const cols = seatsQuery.data.reduce((max, s) => Math.max(max, s.col), 0);
    const present = new Set(seatsQuery.data.map((s) => seatKey(s.row, s.col)));

    const status = new Map<string, SeatStatus>();
    for (const row of rowLabels) {
      for (let col = 1; col <= cols; col++) {
        const key = seatKey(row, col);
        status.set(key, present.has(key) ? "available" : "unavailable");
      }
    }

    setRows(rowLabels);
    setMaxCols(cols);
    setSeatStatus(status);
    setIsDirty(false);
  }, [seatsQuery.data]);

  const updateSeatsMutation = useTheatreSeatsLayoutMtn(theatreQuery.data?.id!, seatStatus);

  function toggleSeat(row: string, col: number) {
    setSeatStatus((prev) => {
      const next = new Map(prev);
      const key = seatKey(row, col);
      const current = next.get(key) ?? "unavailable";
      next.set(key, current === "available" ? "unavailable" : "available");
      return next;
    });
    setIsDirty(true);
  }

  function addRow() {
    const label = nextRowLabel(rows);
    setRows((prev) => [...prev, label]);
    setSeatStatus((prev) => {
      const next = new Map(prev);
      for (let c = 1; c <= maxCols; c++) next.set(seatKey(label, c), "unavailable");
      return next;
    });
    setIsDirty(true);
  }

  function addColumn() {
    const newCol = maxCols + 1;
    setMaxCols(newCol);
    setSeatStatus((prev) => {
      const next = new Map(prev);
      for (const row of rows) next.set(seatKey(row, newCol), "unavailable");
      return next;
    });
    setIsDirty(true);
  }

  function discardChanges() {
    if (!seatsQuery.data) return;
    const rowLabels = Array.from(new Set(seatsQuery.data.map((s) => s.row))).sort();
    const cols = seatsQuery.data.reduce((max, s) => Math.max(max, s.col), 0);
    const present = new Set(seatsQuery.data.map((s) => seatKey(s.row, s.col)));

    const status = new Map<string, SeatStatus>();
    for (const row of rowLabels) {
      for (let col = 1; col <= cols; col++) {
        const key = seatKey(row, col);
        status.set(key, present.has(key) ? "available" : "unavailable");
      }
    }

    setRows(rowLabels);
    setMaxCols(cols);
    setSeatStatus(status);
    setIsDirty(false);
  }

  if (!session) return null;

  if (theatreQuery.isPending) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading theatre…</div>
    );
  }

  if (theatreQuery.isError) {
    return <ErrorComponent message={theatreQuery.error.message} />;
  }

  const totalSeats = Array.from(seatStatus.values()).filter((s) => s === "available").length;
  const totalRows = rows.length;

  return (
    <div className="relative overflow-hidden bg-background pb-28 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-primary/8 via-transparent to-transparent" />

      <TheatreDetailsComponent theatre={theatreQuery.data} totalSeats={totalSeats} totalRows={totalRows} />

      <div className="w-full px-4 py-6">
        <TheatreScreen />

        <div className="mt-8 flex flex-col items-center gap-4">
          <Legend />
          <Toolbar onAddRow={addRow} onAddColumn={addColumn} />
        </div>

        <div className="mt-6">
          {seatsQuery.isPending && <p className="text-center text-sm text-muted-foreground">Loading seats…</p>}
          {seatsQuery.isError && (
            <p className="text-center text-sm text-primary">
              Couldn't load the seat layout. {seatsQuery.error.message}
            </p>
          )}
          {seatsQuery.isSuccess && (
            <SeatsComponent rows={rows} maxCols={maxCols} seatStatus={seatStatus} onToggle={toggleSeat} />
          )}
        </div>
      </div>

      {isDirty && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
            <span className="text-sm text-muted-foreground">Unsaved layout changes</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={discardChanges}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={updateSeatsMutation.isPending}
                onClick={() => {
                  updateSeatsMutation.mutate();
                }}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:cursor-pointer hover:brightness-110 disabled:opacity-50"
              >
                {updateSeatsMutation.isPending ? "Saving…" : "Save layout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TheatreDetailsComponent({
  theatre,
  totalSeats,
  totalRows,
}: {
  theatre: Theatre;
  totalSeats: number;
  totalRows: number;
}) {
  return (
    <div className="border-b border-border px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-primary/80">Manage seats</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{theatre.title}</h1>
        {theatre.address && <p className="mt-1 text-sm text-muted-foreground">{theatre.country}</p>}
        <div className="mt-5 flex gap-6 text-sm">
          <div>
            <span className="block text-lg font-semibold text-foreground">{totalRows}</span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">rows</span>
          </div>
          <div>
            <span className="block text-lg font-semibold text-foreground">{totalSeats}</span>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">available seats</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { label: "Available", className: "border border-border" },
    { label: "Unavailable", className: "border border-dashed border-border" },
  ];
  return (
    <div className="flex items-center gap-5 text-xs text-muted-foreground">
      {items.map(({ label, className }) => (
        <div key={label} className="flex items-center gap-2">
          <span className={cn("h-3.5 w-3.5 rounded-sm", className)} />
          {label}
        </div>
      ))}
    </div>
  );
}

function Toolbar({ onAddRow, onAddColumn }: { onAddRow: () => void; onAddColumn: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onAddRow}
        className="rounded-md hover:cursor-pointer border border-border px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:border-primary/40 hover:text-white"
      >
        + Add row
      </button>
      <button
        type="button"
        onClick={onAddColumn}
        className="rounded-md hover:cursor-pointer border border-border px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:border-primary/40 hover:text-white"
      >
        + Add column
      </button>
    </div>
  );
}

function SeatsComponent({
  rows,
  maxCols,
  seatStatus,
  onToggle,
}: {
  rows: string[];
  maxCols: number;
  seatStatus: SeatStatusMap;
  onToggle: (row: string, col: number) => void;
}) {
  if (rows.length === 0 || maxCols === 0) {
    return (
      <div className="mx-auto max-w-sm py-16 text-center">
        <p className="text-sm font-medium text-foreground/90">No layout yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Add a row and a column above to start building the seat map.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-2.5 pt-4 pb-8">
      {rows.map((row) => (
        <div key={row} className="flex w-full items-center justify-center gap-3">
          <span className="w-4 shrink-0 text-center text-xs font-semibold text-muted-foreground">{row}</span>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: maxCols }).map((_, idx) => {
              const col = idx + 1;
              const status = seatStatus.get(seatKey(row, col)) ?? "unavailable";
              const isAvailable = status === "available";
              return (
                <button
                  key={seatKey(row, col)}
                  type="button"
                  aria-label={
                    isAvailable
                      ? `Seat ${row}${col}, available. Click to mark unavailable.`
                      : `Slot ${row}${col}, unavailable. Click to mark available.`
                  }
                  aria-pressed={isAvailable}
                  onClick={() => onToggle(row, col)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-medium tracking-widest transition-colors duration-150 ease-in hover:cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                    isAvailable
                      ? "border border-border text-foreground/90 hover:border-primary hover:text-primary"
                      : "border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-muted-foreground",
                  )}
                >
                  {col >= 10 ? String(col) : "0" + String(col)}
                </button>
              );
            })}
          </div>
          <span className="w-4 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default ManageSeatsPage;
