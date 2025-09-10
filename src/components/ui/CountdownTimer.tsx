// src/components/ui/CountdownTimer.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const cx = (...v: Array<string | undefined | false | null>) =>
  v.filter(Boolean).join(" ");

export type CountdownLabels = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export type CountdownTimerProps = {
  /** Target date/time as Date, ISO string, or millisecond epoch */
  target: Date | string | number;
  /** Called once when the countdown hits zero */
  onComplete?: () => void;
  /** Render in a compact single-line format (e.g., 2d 03:12:10) */
  variant?: "compact" | "stacked";
  /** Additional class names */
  className?: string;
  /** i18n labels */
  labels?: Partial<CountdownLabels>;
  /** Update interval in ms (1000 by default) */
  tickMs?: number;
  /** aria-live politeness */
  ariaLive?: "off" | "polite" | "assertive";
};

type TimeLeft = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const DEFAULT_LABELS: CountdownLabels = {
  days: "days",
  hours: "hours",
  minutes: "minutes",
  seconds: "seconds",
};

function toDate(input: Date | string | number): Date | null {
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

function computeTimeLeft(target: Date): TimeLeft {
  const now = Date.now();
  const totalMs = Math.max(0, target.getTime() - now);
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { totalMs, days, hours, minutes, seconds };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  target,
  onComplete,
  variant = "compact",
  className,
  labels: labelsProp,
  tickMs = 1000,
  ariaLive = "polite",
}) => {
  const targetDate = useMemo(() => toDate(target), [target]);
  const labels = { ...DEFAULT_LABELS, ...(labelsProp ?? {}) };
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    const d = targetDate ?? new Date(Date.now());
    return computeTimeLeft(d);
  });
  const completedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start ticking once on mount or when target changes
  useEffect(() => {
    if (!targetDate) return;

    const update = () => {
      setTimeLeft(() => {
        const next = computeTimeLeft(targetDate);
        if (next.totalMs === 0 && !completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return next;
      });
    };

    // setInterval pour cadence 1s + rAF anti-drift
    update();
    intervalRef.current = setInterval(update, Math.max(250, tickMs));
    if (typeof window !== "undefined" && "requestAnimationFrame" in window) {
      const loop = () => {
        update();
        rafRef.current = window.requestAnimationFrame(loop);
      };
      rafRef.current = window.requestAnimationFrame(loop);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafRef.current && typeof window !== "undefined") {
        window.cancelAnimationFrame(rafRef.current);
      }
      intervalRef.current = null;
      rafRef.current = null;
    };
  }, [targetDate, tickMs, onComplete]);

  if (!targetDate) {
    return (
      <div
        role="status"
        aria-live={ariaLive}
        className={cx("inline-flex items-baseline gap-2", className)}
      >
        <span className="text-sm text-neutral-500">Invalid date</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds, totalMs } = timeLeft;
  const pad = (n: number) => String(n).padStart(2, "0");
  const compact =
    days > 0
      ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours + days * 24)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <div
      role={totalMs === 0 ? "status" : "timer"}
      aria-live={ariaLive}
      aria-atomic="true"
      className={cx("inline-flex items-center", className)}
    >
      {variant === "compact" ? (
        <span className="tabular-nums font-medium" data-testid="compact-countdown">
          {compact}
        </span>
      ) : (
        <div className="flex items-center gap-3" data-testid="stacked-countdown">
          <TimePill value={days} label={labels.days} />
          <Separator />
          <TimePill value={hours} label={labels.hours} />
          <Separator />
          <TimePill value={minutes} label={labels.minutes} />
          <Separator />
          <TimePill value={seconds} label={labels.seconds} />
        </div>
      )}
    </div>
  );
};

type TimePillProps = { value: number; label: string };
const TimePill: React.FC<TimePillProps> = ({ value, label }) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <span className="tabular-nums text-xl font-semibold leading-none">
        {pad(value)}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-neutral-500">
        {label}
      </span>
    </div>
  );
};

const Separator: React.FC = () => (
  <span aria-hidden className="mx-0.5 text-neutral-400">:</span>
);

export default CountdownTimer;
