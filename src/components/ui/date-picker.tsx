"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { ErrorBoundary } from "@/components/ui/error-boundary"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstDow(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function toDateValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function toDateTimeValue(d: Date) {
  const date = toDateValue(d);
  const tz = -d.getTimezoneOffset();
  const sign = tz >= 0 ? "+" : "-";
  const tzHours = String(Math.floor(Math.abs(tz) / 60)).padStart(2, "0");
  const tzMins = String(Math.abs(tz) % 60).padStart(2, "0");
  return `${date}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}${sign}${tzHours}:${tzMins}`
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function fmtDateTime(d: Date) {
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

interface DatePickerProps {
  name: string
  required?: boolean
  includeTime?: boolean
  defaultValue?: string
  placeholder?: string
  className?: string
}

function DatePickerInner({
  name,
  required,
  includeTime = false,
  defaultValue,
  placeholder,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [touched, setTouched] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const initDate = React.useMemo(() => {
    try {
      if (!defaultValue) return undefined
      const d = new Date(defaultValue)
      return isNaN(d.getTime()) ? undefined : d
    } catch {
      return undefined
    }
  }, [defaultValue])

  const [selected, setSelected] = React.useState<Date | undefined>(initDate)
  const today = React.useRef(new Date())

  const [viewYear, setViewYear] = React.useState(() => initDate?.getFullYear() ?? today.current.getFullYear())
  const [viewMonth, setViewMonth] = React.useState(() => initDate?.getMonth() ?? today.current.getMonth())

  const hiddenValue = (() => {
    try {
      if (!selected) return ""
      return includeTime ? toDateTimeValue(selected) : toDateValue(selected)
    } catch {
      return ""
    }
  })()

  const numDays = daysInMonth(viewYear, viewMonth)
  const startDow = firstDow(viewYear, viewMonth)

  function pickDay(day: number) {
    try {
      const next = new Date(viewYear, viewMonth, day)
      if (selected) next.setHours(selected.getHours(), selected.getMinutes())
      setSelected(next)
      setOpen(false)
    } catch {
      // ignore
    }
  }

  function prevMonth() {
    try {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
      else setViewMonth(m => m - 1)
    } catch { /* ignore */ }
  }

  function nextMonth() {
    try {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
      else setViewMonth(m => m + 1)
    } catch { /* ignore */ }
  }

  function goToday() {
    try {
      const now = new Date()
      setViewMonth(now.getMonth())
      setViewYear(now.getFullYear())
      if (!selected) setSelected(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    } catch { /* ignore */ }
  }

  function setTime(h: number, m: number) {
    try {
      setSelected(prev => {
        const d = prev ? new Date(prev) : new Date(viewYear, viewMonth, 1)
        d.setHours(h, m)
        return d
      })
    } catch { /* ignore */ }
  }

  function isSel(day: number) {
    try {
      if (!selected) return false
      return sameDay(new Date(viewYear, viewMonth, day), selected)
    } catch { return false }
  }

  function isTod(day: number) {
    try {
      return sameDay(new Date(viewYear, viewMonth, day), today.current)
    } catch { return false }
  }

  const [validationMsg, setValidationMsg] = React.useState("")

  React.useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      try {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      } catch { /* ignore */ }
    }
    document.addEventListener("mousedown", handleClick, true)
    return () => document.removeEventListener("mousedown", handleClick, true)
  }, [open])

  React.useEffect(() => {
    const form = wrapperRef.current?.closest("form")
    if (!form || !required) return
    function handleSubmit(e: Event) {
      if (!selected) {
        e.preventDefault()
        setValidationMsg("Please select a date")
        setOpen(true)
      }
    }
    form.addEventListener("submit", handleSubmit)
    return () => form.removeEventListener("submit", handleSubmit)
  }, [required, selected])

  React.useEffect(() => {
    if (selected) setValidationMsg("")
  }, [selected])

  const fallbackPlaceholder = includeTime ? "Pick date & time" : "Pick a date"

  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({ position: "fixed", visibility: "hidden", top: 0, left: 0 });

  React.useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: Math.min(rect.left, window.innerWidth - 300),
      width: Math.max(rect.width, 280),
      visibility: "visible",
    });
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex h-10 w-full cursor-pointer items-center gap-2 border border-transparent border-b-input bg-transparent px-0 py-1 text-base outline-none transition-[color,border-color] focus-visible:border-b-ring md:text-sm",
          !selected && "text-muted-foreground",
          "text-left",
          className,
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate">
          {selected ? (includeTime ? fmtDateTime(selected) : fmtDate(selected)) : (placeholder ?? fallbackPlaceholder)}
        </span>
      </button>
      <input type="hidden" name={name} value={hiddenValue} required={required} />
      {validationMsg && (
        <p className="mt-1 text-xs text-red-400">{validationMsg}</p>
      )}
      {open && (
        <div className="z-50 mt-1 min-w-[280px] rounded-md border border-border/70 bg-popover p-4 shadow-lg ring-1 ring-foreground/10 outline-none" style={dropdownStyle}>
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map(d => (
              <div key={d} className="flex h-8 items-center justify-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startDow }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: numDays }).map((_, i) => {
              const day = i + 1
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => pickDay(day)}
                  className={cn(
                    "flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors",
                    isSel(day)
                      ? "bg-primary text-primary-foreground font-semibold"
                      : isTod(day)
                        ? "border border-primary/40 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
          {includeTime && (
            <div className="mt-3 flex items-center gap-2 border-t border-border/50 pt-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex items-center gap-1">
                <select
                  value={selected?.getHours() ?? 12}
                  onChange={e => setTime(parseInt(e.target.value), selected?.getMinutes() ?? 0)}
                  className="h-8 w-[68px] rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2, "0")}</option>
                  ))}
                </select>
                <span className="text-muted-foreground">:</span>
                <select
                  value={selected?.getMinutes() ?? 0}
                  onChange={e => setTime(selected?.getHours() ?? 12, parseInt(e.target.value))}
                  className="h-8 w-[68px] rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                    <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    const now = new Date()
                    setSelected(now)
                    setViewMonth(now.getMonth())
                    setViewYear(now.getFullYear())
                  } catch { /* ignore */ }
                }}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Now
              </button>
            </div>
          )}
          {!includeTime && (
            <div className="mt-2 flex justify-end">
              <button type="button" onClick={goToday} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Today
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function DatePicker(props: DatePickerProps) {
  return (
    <ErrorBoundary fallback={<input type={props.includeTime ? "datetime-local" : "date"} name={props.name} required={props.required} className="h-10 w-full border border-transparent border-b-input bg-transparent px-0 py-1 text-base outline-none md:text-sm" />}>
      <DatePickerInner {...props} />
    </ErrorBoundary>
  )
}
