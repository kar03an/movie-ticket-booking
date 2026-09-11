"use client";

import { useMemo, useState } from "react";
import { addDays, format, isBefore, isSameDay, parse, set as setTime, startOfDay } from "date-fns";
import { CalendarDays, Clock, IndianRupee } from "lucide-react";
import { Calendar } from "@movie-ticket-booking/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@movie-ticket-booking/ui/components/popover";
import { cn } from "@/lib/utils";

export type ShowtimeFormValues = {
  date: string;
  time: string;
  price: string;
};

const SHOW_SLOTS = [
  { time: "09:00", label: "9:00 AM", hint: "Morning" },
  { time: "12:30", label: "12:30 PM", hint: "Matinee" },
  { time: "16:00", label: "4:00 PM", hint: "Afternoon" },
  { time: "18:30", label: "6:30 PM", hint: "Prime" },
  { time: "21:30", label: "9:30 PM", hint: "Late" },
  { time: "22:45", label: "10:45 PM", hint: "Night" },
] as const;

const PRICE_PRESETS = [149, 199, 249, 349, 449];
const SHOW_DURATION_HOURS = 3;

function toDateValue(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function parseDateValue(value: string) {
  if (!value) return null;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function combineDateTime(date: string, time: string) {
  const day = parseDateValue(date);
  if (!day || !time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return setTime(day, { hours, minutes, seconds: 0, milliseconds: 0 });
}

function isSlotPast(date: string, time: string) {
  const start = combineDateTime(date, time);
  return Boolean(start && isBefore(start, new Date()));
}

function formatSlotLabel(time: string) {
  const preset = SHOW_SLOTS.find((slot) => slot.time === time);
  if (preset) return preset.label;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const marker = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${marker}`;
}

export function ShowtimeForm({
  value,
  onChange,
}: {
  value: ShowtimeFormValues;
  onChange: (value: ShowtimeFormValues) => void;
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = startOfDay(new Date());
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(today, i)), [today]);
  const selectedDate = parseDateValue(value.date);
  const selectedInWeek = selectedDate ? weekDays.some((day) => isSameDay(day, selectedDate)) : false;
  const startAt = combineDateTime(value.date, value.time);
  const priceNumber = Number(value.price);
  const hasPrice = Number.isFinite(priceNumber) && priceNumber > 0;

  function update<K extends keyof ShowtimeFormValues>(key: K, val: ShowtimeFormValues[K]) {
    const next = { ...value, [key]: val };
    if (key === "date" && next.time && isSlotPast(val as string, next.time)) {
      next.time = "";
    }
    onChange(next);
  }

  function selectDate(day: Date) {
    update("date", toDateValue(day));
    setCalendarOpen(false);
  }

  function onPriceChange(raw: string) {
    const cleaned = raw.replace(/[^\d.]/g, "");
    const [whole, fraction] = cleaned.split(".");
    const next = fraction === undefined ? whole : `${whole}.${fraction.slice(0, 2)}`;
    update("price", next);
  }

  return (
    <div className="surface-card w-full max-w-2xl p-5 sm:p-6">
      <div className="mb-6">
        <p className="eyebrow">Showtime details</p>
        <h2 className="font-display mt-1 text-xl font-semibold">When should this play?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a day, a house slot, and a ticket price. Past times on today are closed.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="field-label">Date</span>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
              <CalendarDays className="size-3.5" />
              {selectedInWeek || !selectedDate ? "More dates" : format(selectedDate, "d MMM")}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto rounded-xl p-3">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(day) => day && selectDate(day)}
                disabled={{ before: today }}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {weekDays.map((day) => {
            const key = toDateValue(day);
            const active = value.date === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectDate(day)}
                className={cn(
                  "flex min-w-16 shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <span className="text-[10px] font-semibold tracking-wider uppercase">
                  {isSameDay(day, today) ? "Today" : format(day, "EEE")}
                </span>
                <span className="mt-0.5 text-lg font-semibold leading-none">{format(day, "d")}</span>
                <span className="mt-1 text-[10px] uppercase">{format(day, "MMM")}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7 space-y-3">
        <div className="flex items-center justify-between">
          <span className="field-label">Showtime</span>
          {startAt && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Ends {format(setTime(startAt, { hours: startAt.getHours() + SHOW_DURATION_HOURS }), "h:mm a")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SHOW_SLOTS.map((slot) => {
            const past = isSlotPast(value.date || toDateValue(today), slot.time);
            const active = value.time === slot.time;
            return (
              <button
                key={slot.time}
                type="button"
                disabled={!value.date || past}
                onClick={() => update("time", slot.time)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition",
                  active
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-card hover:border-primary/40",
                  (!value.date || past) && "cursor-not-allowed opacity-40 hover:border-border",
                )}
              >
                <span className="block text-sm font-semibold">{slot.label}</span>
                <span className="text-[11px] text-muted-foreground">{past ? "Started" : slot.hint}</span>
              </button>
            );
          })}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[11px] text-muted-foreground">Custom time</span>
          <input
            type="time"
            value={value.time}
            min={value.date === toDateValue(today) ? format(new Date(), "HH:mm") : undefined}
            onChange={(e) => update("time", e.target.value)}
            className="field-input max-w-40 py-2.5"
          />
        </label>
        {!value.date && <p className="text-xs text-muted-foreground">Choose a date to unlock showtimes.</p>}
      </section>

      <section className="mt-7 space-y-3">
        <span className="field-label">Ticket price</span>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((amount) => {
            const active = hasPrice && priceNumber === amount;
            return (
              <button
                key={amount}
                type="button"
                onClick={() => update("price", String(amount))}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                ₹{amount}
              </button>
            );
          })}
        </div>
        <div className="relative max-w-56">
          <IndianRupee className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            inputMode="decimal"
            value={value.price}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder="249"
            className="field-input pl-9"
          />
        </div>
      </section>

      <div className="mt-7 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Scheduled as</p>
        <p className="mt-1 text-sm font-medium">
          {selectedDate ? format(selectedDate, "EEEE, d MMMM") : "Pick a date"}
          <span className="mx-2 text-muted-foreground">·</span>
          {value.time ? formatSlotLabel(value.time) : "Pick a time"}
          <span className="mx-2 text-muted-foreground">·</span>
          {hasPrice ? `₹${priceNumber.toFixed(priceNumber % 1 === 0 ? 0 : 2)}` : "Set a price"}
        </p>
      </div>
    </div>
  );
}
