"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function DatePicker({ value, onChange, disabled }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(value || new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentMonth(value);
    }
  }, [value]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  function handleSelectDate(day: Date) {
    setSelectedDate(day);
    onChange(day);
  }

  function handlePrevMonth() {
    setCurrentMonth(subMonths(currentMonth, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(addMonths(currentMonth, 1));
  }

  return (
    <div className="w-[280px] rounded-xl border bg-popover p-4 shadow-lg">
      {/* Header com mês/ano e navegação */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handlePrevMonth}
          disabled={disabled}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleNextMonth}
          disabled={disabled}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dias do calendário */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => handleSelectDate(day)}
              className={cn(
                "h-8 w-8 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center",
                !isCurrentMonth && "text-muted-foreground/40",
                isCurrentMonth && !isSelected && "text-foreground hover:bg-accent hover:text-accent-foreground",
                isTodayDate && !isSelected && "border border-primary text-primary font-bold",
                isSelected && "bg-primary text-primary-foreground shadow-md scale-105",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Footer com data selecionada */}
      {selectedDate && (
        <div className="mt-3 pt-3 border-t flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>
            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      )}
    </div>
  );
}
