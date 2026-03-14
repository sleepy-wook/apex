"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin } from "lucide-react"
import type { ScheduleEvent } from "@/types/schedule"

interface NextRaceBannerProps {
  event: ScheduleEvent
  year: number
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function getTimeLeft(targetDate: Date): TimeLeft | null {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  if (diff <= 0) return null

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function NextRaceBanner({ event, year }: NextRaceBannerProps) {
  const raceSession = event.sessions.find((s) => s.session_type === "Race")
  const raceDate = raceSession?.date_start ? new Date(raceSession.date_start) : null

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    raceDate ? getTimeLeft(raceDate) : null,
  )

  useEffect(() => {
    if (!raceDate) return
    const timer = setInterval(() => {
      const tl = getTimeLeft(raceDate)
      setTimeLeft(tl)
      if (!tl) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [raceDate])

  if (!timeLeft || !raceDate) return null

  const raceTimeKST = raceDate.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  })

  const raceDateStr = raceDate.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })

  // Find earliest session for weekend start
  const sessionDates = event.sessions
    .filter((s) => s.date_start)
    .map((s) => new Date(s.date_start!))
    .sort((a, b) => a.getTime() - b.getTime())
  const weekendStart = sessionDates[0]

  const isRaceWeekend = weekendStart && new Date() >= weekendStart

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: Race Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isRaceWeekend ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                  레이스 위크
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                  다음 레이스
                </span>
              )}
            </div>

            <div>
              <Link
                href={`/schedule/${year}`}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                {event.country_name} 그랑프리
              </Link>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin size={10} />
                  {event.circuit_short_name}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={10} />
                  {raceDateStr}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock size={10} />
                  {raceTimeKST} KST
                </span>
              </div>
            </div>
          </div>

          {/* Right: Countdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <CountdownUnit value={timeLeft.days} label="일" />
              <span className="text-muted-foreground font-mono text-sm">:</span>
              <CountdownUnit value={timeLeft.hours} label="시" />
              <span className="text-muted-foreground font-mono text-sm">:</span>
              <CountdownUnit value={timeLeft.minutes} label="분" />
              <span className="text-muted-foreground font-mono text-sm">:</span>
              <CountdownUnit value={timeLeft.seconds} label="초" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-lg font-bold text-foreground tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">
        {label}
      </span>
    </div>
  )
}
