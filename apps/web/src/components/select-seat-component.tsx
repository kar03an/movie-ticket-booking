import { cn } from "@/lib/utils";
import { useMemo } from "react";
import TheatreScreen from "@/components/theatre-screen";

type SeatStatus = "AVAILABLE" | "SOLD";

interface TheatreMovieSeatDto {
  id: string;
  showId: string;
  seatId: string;
  status: SeatStatus;
  price: number;
  seat: {
    id: string;
    row: string;
    col: number;
  };
}

interface SeatMapProps {
  seats: TheatreMovieSeatDto[];
  selectedSeatId: string | null;
  onSelectSeat: (seat: TheatreMovieSeatDto) => void;
}

export default function SelectTheatreMovieSeat({ seats, selectedSeatId, onSelectSeat }: SeatMapProps) {
  const rows = useMemo(() => {
    const grouped = new Map<string, TheatreMovieSeatDto[]>();
    for (const seat of seats) {
      const rowKey = seat.seat.row;
      if (!grouped.has(rowKey)) grouped.set(rowKey, []);
      grouped.get(rowKey)!.push(seat);
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([row, rowSeats]) => ({
        row,
        seats: rowSeats.sort((a, b) => a.seat.col - b.seat.col),
      }));
  }, [seats]);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <TheatreScreen />

      <div className="flex flex-col gap-2.5">
        {rows.length == 0 && <i className="text-sm text-muted-foreground">No seats available.</i>}
        {rows.map(({ row, seats: rowSeats }) => (
          <div key={row} className="flex items-center gap-3">
            <span className="w-4 text-center text-xs font-semibold text-muted-foreground">{row}</span>
            <div className="flex gap-2">
              {rowSeats.map((seat) => {
                const isSold = seat.status === "SOLD";
                const isSelected = seat.id === selectedSeatId;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={isSold}
                    aria-label={`Seat ${row}${seat.seat.col}, ${
                      isSold ? "sold" : isSelected ? "selected" : "available"
                    }`}
                    aria-pressed={isSelected}
                    onClick={() => onSelectSeat(seat)}
                    className={cn(
                      "h-7 w-7 rounded-md border text-[10px] font-medium transition-colors",
                      "hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                      isSold && "cursor-not-allowed border-border bg-muted/40 text-muted-foreground/40",
                      !isSold &&
                        !isSelected &&
                        "border-border bg-secondary text-foreground hover:border-primary hover:bg-primary/15",
                      isSelected && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {seat.seat.col}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-border bg-secondary" />
          Available
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-primary bg-primary" />
          Selected
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-border bg-muted/40" />
          Sold
        </div>
      </div>
    </div>
  );
}
