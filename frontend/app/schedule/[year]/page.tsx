import Link from "next/link";
import { getSchedule } from "@/lib/api";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Trophy, Clock, ChevronRight } from "lucide-react";
import { AdSlot } from "@/components/common/AdSlot";
import { RelatedPages } from "@/components/common/RelatedPages";
import type { ScheduleEvent } from "@/types/schedule";

export const revalidate = 86400;

interface SchedulePageProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: SchedulePageProps) {
  const { year } = await params;
  return {
    title: `${year} 시즌 일정 | APEX`,
    description: `${year} F1 시즌 전체 레이스 일정 및 세션 시간표`,
  };
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const { year } = await params;
  const yearNum = Number(year);

  if (isNaN(yearNum)) {
    notFound();
  }

  let events: ScheduleEvent[] = [];
  try {
    const res = await getSchedule(yearNum);
    events = res.events;
  } catch {
    // API unavailable — show empty state
  }

  const completedEvents = events.filter((e) => e.winner_name);
  const upcomingEvents = events.filter((e) => !e.winner_name);

  // Group events by month
  const eventsByMonth = new Map<string, ScheduleEvent[]>();
  for (const event of events) {
    const raceSession = event.sessions.find((s) => s.session_type === "Race");
    if (raceSession?.date_start) {
      const date = new Date(raceSession.date_start);
      const monthKey = date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
      });
      if (!eventsByMonth.has(monthKey)) {
        eventsByMonth.set(monthKey, []);
      }
      eventsByMonth.get(monthKey)!.push(event);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">
          홈
        </Link>
        <span>/</span>
        <span className="text-foreground">{yearNum} 일정</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-5 bg-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            {yearNum} 시즌 일정
          </h1>
        </div>
        <p className="text-muted-foreground ml-4">
          총 {events.length}개 그랑프리 | {completedEvents.length}개 완료 |{" "}
          {upcomingEvents.length}개 예정
        </p>
      </div>

      {/* Schedule by Month */}
      {(() => {
        const monthEntries = Array.from(eventsByMonth.entries());
        const midpoint = Math.ceil(monthEntries.length / 2);
        return (
          <>
            {monthEntries.map(([month, monthEvents], idx) => (
              <div key={month}>
                <section className="mb-10">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    {month}
                  </h2>
                  <div className="space-y-4">
                    {monthEvents.map((event) => (
                      <EventCard
                        key={event.circuit_key}
                        event={event}
                        year={yearNum}
                      />
                    ))}
                  </div>
                </section>
                {idx === midpoint - 1 && monthEntries.length > 3 && <AdSlot />}
              </div>
            ))}
          </>
        );
      })()}

      {events.length === 0 && (
        <div className="border border-border bg-card p-6">
          <p className="text-muted-foreground">
            시즌 일정을 불러올 수 없습니다.
          </p>
        </div>
      )}

      {events.length > 0 && <AdSlot />}

      <RelatedPages
        links={[
          { href: `/standings/${yearNum}`, label: "챔피언십 순위", description: "드라이버 & 컨스트럭터 순위" },
          { href: `/teams/${yearNum}`, label: "팀", description: "컨스트럭터 팀 목록" },
          { href: "/drivers", label: "드라이버", description: "현재 시즌 드라이버 목록" },
        ]}
      />
    </div>
  );
}

function EventCard({
  event,
  year,
}: {
  event: ScheduleEvent;
  year: number;
}) {
  const isCompleted = !!event.winner_name;
  const raceSession = event.sessions.find((s) => s.session_type === "Race");
  const raceDate = raceSession?.date_start
    ? new Date(raceSession.date_start)
    : null;

  // Find the earliest and latest session for the weekend range
  const sessionDates = event.sessions
    .filter((s) => s.date_start)
    .map((s) => new Date(s.date_start!))
    .sort((a, b) => a.getTime() - b.getTime());

  const weekendStart = sessionDates[0];
  const weekendEnd = sessionDates[sessionDates.length - 1];

  const dateRange =
    weekendStart && weekendEnd
      ? `${weekendStart.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} - ${weekendEnd.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}`
      : "";

  const raceDayStr = raceDate
    ? raceDate.toLocaleDateString("ko-KR", { weekday: "short" })
    : "";

  // Convert race time to KST
  const raceTimeKST = raceDate
    ? raceDate.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
      })
    : "";

  // Session type ordering for display
  const sessionOrder = [
    "Practice",
    "Qualifying",
    "Sprint Qualifying",
    "Sprint",
    "Race",
  ];

  // Session label translations
  const sessionLabel = (name: string | null, type: string | null): string => {
    const labels: Record<string, string> = {
      "Practice 1": "연습 1",
      "Practice 2": "연습 2",
      "Practice 3": "연습 3",
      "Qualifying": "예선",
      "Sprint Qualifying": "스프린트 예선",
      "Sprint Shootout": "스프린트 슛아웃",
      "Sprint": "스프린트",
      "Race": "결승",
    };
    return labels[name || ""] || labels[type || ""] || name || type || "";
  };

  const sortedSessions = [...event.sessions].sort((a, b) => {
    if (a.date_start && b.date_start)
      return (
        new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
      );
    return 0;
  });

  const content = (
    <div
      className={`border border-border bg-card overflow-hidden transition-colors ${
        isCompleted ? "hover:bg-muted/50 cursor-pointer" : "opacity-80"
      }`}
    >
      <div className="flex items-stretch">
        {/* Left color bar */}
        <div
          className="w-1 shrink-0"
          style={{
            backgroundColor: event.winner_team_colour
              ? `#${event.winner_team_colour.replace("#", "")}`
              : isCompleted
                ? "var(--primary)"
                : undefined,
          }}
        />

        <div className="flex-1 p-4 sm:p-5">
          {/* Top Row: Round + Country */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {event.round && (
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold font-mono text-muted-foreground">
                    R{event.round}
                  </span>
                </div>
              )}
              <div>
                <p className="text-base font-semibold text-foreground">
                  {event.country_name} 그랑프리
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {event.circuit_key && !isCompleted ? (
                    <Link
                      href={`/circuits/${event.circuit_key}`}
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                      <MapPin size={10} />
                      {event.circuit_short_name}
                      {event.location && event.location !== event.circuit_short_name && `, ${event.location}`}
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={10} />
                      {event.circuit_short_name}
                      {event.location && event.location !== event.circuit_short_name && `, ${event.location}`}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={10} />
                    {dateRange}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Winner or race time */}
              {isCompleted ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500" />
                  <span className="text-sm text-muted-foreground">
                    {event.winner_name}
                  </span>
                </div>
              ) : raceTimeKST ? (
                <div className="hidden sm:flex items-center gap-1.5">
                  <Clock size={12} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {raceTimeKST} KST
                  </span>
                </div>
              ) : null}

              {isCompleted && (
                <ChevronRight
                  size={16}
                  className="text-muted-foreground shrink-0"
                />
              )}
            </div>
          </div>

          {/* Session Timeline */}
          <div className="flex flex-wrap gap-2 ml-[52px]">
            {sortedSessions.map((session) => {
              const sessionDate = session.date_start
                ? new Date(session.date_start)
                : null;
              const timeStr = sessionDate
                ? sessionDate.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Seoul",
                  })
                : "";
              const dayStr = sessionDate
                ? sessionDate.toLocaleDateString("ko-KR", {
                    weekday: "short",
                  })
                : "";

              const isRace = session.session_type === "Race";

              return (
                <div
                  key={session.session_key}
                  className={`px-2.5 py-1 text-[11px] rounded ${
                    isRace
                      ? "bg-primary/10 text-primary font-semibold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span>{sessionLabel(session.session_name, session.session_type)}</span>
                  {timeStr && (
                    <span className="ml-1.5 opacity-70">
                      {dayStr} {timeStr}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  if (isCompleted && event.round) {
    return (
      <Link href={`/race/${year}/${event.round}`}>{content}</Link>
    );
  }

  return content;
}
