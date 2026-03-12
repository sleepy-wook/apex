import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "F1 기본 규칙 | APEX",
  description:
    "F1이란 무엇인지, 시즌 구조, GP 주말 일정, 포인트 시스템, 깃발 규칙, DRS, 타이어까지. F1 입문자를 위한 기본 가이드.",
  openGraph: {
    title: "F1 기본 규칙 | APEX",
    description:
      "F1 입문자를 위한 기본 가이드. 시즌 구조, 포인트 시스템, 깃발 규칙, DRS, 타이어 전략까지 한국어로 쉽게 설명합니다.",
  },
};

export default function BasicsPage() {
  return (
    <article className="max-w-3xl">
      <PageHeader
        title="F1 기본 규칙"
        subtitle="Formula 1을 처음 접하는 분들을 위한 기본 가이드"
        breadcrumbs={[
          { label: "가이드", href: "/guide" },
          { label: "기본 규칙" },
        ]}
      />

      {/* F1이란? */}
      <Section title="F1이란?">
        <p>
          Formula 1(포뮬러 원)은 FIA(국제자동차연맹)가 주관하는 세계 최고 수준의
          오픈휠 자동차 레이싱 대회입니다. &quot;Formula&quot;는 모든 참가자가
          따라야 하는 기술 규정을 의미하고, &quot;1&quot;은 최상위 클래스를
          뜻합니다.
        </p>
        <p>
          1950년에 첫 월드 챔피언십이 시작된 이래 70년 넘게 이어져 온 역사를
          가지고 있으며, 현재 10개 팀(컨스트럭터)이 각각 2명의 드라이버를 출전시켜
          총 20명이 경쟁합니다.
        </p>
        <p>
          F1 머신은 최고 시속 370km 이상에 도달하며, 코너링 시 드라이버에게 6G
          이상의 중력가속도가 걸리는 극한의 스포츠입니다.
        </p>
      </Section>

      {/* 시즌 구조 */}
      <Section title="시즌 구조">
        <p>
          F1 시즌은 보통 3월에 시작해 12월에 끝나며, 한 시즌에 약 24개의
          그랑프리(GP)가 열립니다. 대략 격주 간격으로 진행되며, 중간에 2~4주의
          휴식 기간도 있습니다.
        </p>
        <p>각 GP는 전 세계 다양한 서킷에서 열립니다. 모나코, 실버스톤, 스파,
          모짜, 스즈카 등 전통적인 서킷부터 라스베가스, 싱가포르 같은 시가지
          서킷까지 다양합니다.</p>
        <p>
          시즌이 끝나면 가장 많은 포인트를 획득한 드라이버가 드라이버 챔피언,
          두 드라이버의 포인트 합산이 가장 높은 팀이 컨스트럭터 챔피언이 됩니다.
        </p>
      </Section>

      {/* GP 주말 일정 */}
      <Section title="GP 주말 일정">
        <p>
          일반적인 GP 주말은 금요일부터 일요일까지 3일간 진행됩니다.
        </p>

        <h4 className="text-base font-semibold text-[var(--color-text-primary)] mt-4 mb-2">
          일반 포맷
        </h4>
        <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
          <li><strong className="text-[var(--color-text-primary)]">금요일</strong> &mdash; 프리 프랙티스 1 (FP1), 프리 프랙티스 2 (FP2)</li>
          <li><strong className="text-[var(--color-text-primary)]">토요일</strong> &mdash; 프리 프랙티스 3 (FP3), 퀄리파잉 (예선)</li>
          <li><strong className="text-[var(--color-text-primary)]">일요일</strong> &mdash; 결승 레이스</li>
        </ul>

        <h4 className="text-base font-semibold text-[var(--color-text-primary)] mt-4 mb-2">
          스프린트 포맷 (시즌 중 6회 정도)
        </h4>
        <ul className="list-disc list-inside space-y-1 text-[var(--color-text-secondary)]">
          <li><strong className="text-[var(--color-text-primary)]">금요일</strong> &mdash; FP1, 스프린트 퀄리파잉 (스프린트 슈트아웃)</li>
          <li><strong className="text-[var(--color-text-primary)]">토요일</strong> &mdash; 스프린트 레이스 (약 100km), 퀄리파잉</li>
          <li><strong className="text-[var(--color-text-primary)]">일요일</strong> &mdash; 결승 레이스</li>
        </ul>

        <InfoBox>
          <strong>퀄리파잉(예선)</strong>은 Q1, Q2, Q3의 3단계로 진행됩니다.
          각 단계에서 느린 드라이버가 탈락하며, Q3에서 가장 빠른 랩타임을 기록한
          드라이버가 폴 포지션(1번 그리드)을 차지합니다.
        </InfoBox>
      </Section>

      {/* 포인트 시스템 */}
      <Section title="포인트 시스템">
        <p>결승 레이스에서 상위 10명에게 포인트가 주어집니다.</p>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)]">
                <th className="text-left py-2 pr-4 text-[var(--color-text-tertiary)] font-medium">순위</th>
                <th className="text-right py-2 text-[var(--color-text-tertiary)] font-medium">포인트</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text-secondary)]">
              {[
                [1, 25], [2, 18], [3, 15], [4, 12], [5, 10],
                [6, 8], [7, 6], [8, 4], [9, 2], [10, 1],
              ].map(([pos, pts]) => (
                <tr key={pos} className="border-b border-[var(--color-border-secondary)]">
                  <td className="py-2 pr-4">
                    <span className={pos <= 3 ? "font-semibold text-[var(--color-text-primary)]" : ""}>
                      {pos}위
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono">{pts}점</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4">
          추가로, 결승 상위 10위 안에 들면서 가장 빠른 랩타임을 기록한
          드라이버에게 <strong>패스티스트 랩 보너스 1점</strong>이 주어집니다.
        </p>
        <p>
          스프린트 레이스에서는 상위 8명에게 포인트가 주어집니다 (8-7-6-5-4-3-2-1).
        </p>
      </Section>

      {/* 깃발 & 규칙 */}
      <Section title="깃발 & 규칙">
        <div className="space-y-3">
          <FlagItem color="#22c55e" name="녹색 깃발 (Green Flag)">
            트랙이 안전하며 정상적인 레이싱이 가능한 상태입니다.
          </FlagItem>
          <FlagItem color="#ffd700" name="노란 깃발 (Yellow Flag)">
            위험 구간이 있으니 감속해야 합니다. 추월이 금지됩니다.
            더블 옐로우는 더 심각한 위험을 의미합니다.
          </FlagItem>
          <FlagItem color="#ef4444" name="빨간 깃발 (Red Flag)">
            레이스가 중단됩니다. 심각한 사고, 악천후, 트랙 위 장애물 등의
            상황에서 나옵니다. 모든 차량은 피트레인으로 돌아옵니다.
          </FlagItem>
          <FlagItem color="#3b82f6" name="파란 깃발 (Blue Flag)">
            뒤따르는 차량에게 랩다운(한 바퀴 이상 뒤처진) 상태라는 신호입니다.
            3번 연속 무시하면 페널티를 받습니다.
          </FlagItem>
          <FlagItem
            color="transparent"
            name="체커 깃발 (Chequered Flag)"
            className="bg-[conic-gradient(#fff_25%,#000_25%,#000_50%,#fff_50%,#fff_75%,#000_75%)]"
          >
            레이스 종료! 선두 드라이버가 결승선을 통과하면 체커 깃발이
            흔들립니다.
          </FlagItem>
        </div>

        <InfoBox>
          <strong>세이프티카(SC)</strong>는 사고 등으로 위험할 때 출동해 모든
          차량을 선도하며 속도를 제한합니다.{" "}
          <strong>버추얼 세이프티카(VSC)</strong>는 실제 차량 없이 속도 제한만
          적용하는 방식입니다.
        </InfoBox>
      </Section>

      {/* DRS & 타이어 */}
      <Section title="DRS & 타이어">
        <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
          DRS (Drag Reduction System)
        </h4>
        <p>
          DRS는 뒷날개(리어 윙)를 열어 공기 저항을 줄이는 장치입니다. 앞 차와의
          간격이 1초 이내일 때, 지정된 DRS 존에서만 활성화할 수 있습니다.
          직선에서 약 10~15km/h의 속도 이점을 얻어 추월을 도와줍니다.
        </p>
        <p>
          레이스 시작 후 처음 2바퀴와 세이프티카 직후에는 DRS를 사용할 수 없습니다.
        </p>

        <h4 className="text-base font-semibold text-[var(--color-text-primary)] mt-6 mb-2">
          타이어 컴파운드
        </h4>
        <p>
          F1 타이어는 피렐리(Pirelli)가 독점 공급하며, 드라이 컨디션에서 3종류의
          컴파운드를 사용합니다.
        </p>

        <div className="grid gap-3 mt-4 sm:grid-cols-3">
          <TyreCard
            color="var(--color-tyre-soft)"
            name="소프트 (Soft)"
            desc="가장 빠르지만 마모가 빠릅니다. 주로 퀄리파잉이나 짧은 스틴트에 사용합니다."
          />
          <TyreCard
            color="var(--color-tyre-medium)"
            name="미디엄 (Medium)"
            desc="속도와 내구성의 균형을 갖춘 타이어. 다양한 전략에 활용됩니다."
          />
          <TyreCard
            color="var(--color-tyre-hard)"
            name="하드 (Hard)"
            desc="가장 내구성이 높지만 그립이 낮습니다. 긴 스틴트에 적합합니다."
          />
        </div>

        <div className="grid gap-3 mt-3 sm:grid-cols-2">
          <TyreCard
            color="var(--color-tyre-intermediate)"
            name="인터미디엇 (Intermediate)"
            desc="약간의 수분이 있는 트랙에서 사용하는 젖은 노면용 타이어."
          />
          <TyreCard
            color="var(--color-tyre-wet)"
            name="웻 (Wet)"
            desc="폭우 상황에서 사용하는 풀 웻 타이어. 배수 능력이 가장 뛰어납니다."
          />
        </div>

        <InfoBox>
          레이스 중 최소 2가지 이상의 드라이 컴파운드를 사용해야 하는 규정이
          있습니다. 이 때문에 피트스탑이 전략의 핵심이 됩니다. 언제, 어떤
          타이어로 교체하느냐에 따라 순위가 뒤바뀌기도 합니다.
        </InfoBox>
      </Section>
    </article>
  );
}

/* ---- Helper Components ---- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 pb-2 border-b border-[var(--color-border-secondary)]">
        {title}
      </h2>
      <div className="space-y-3 text-[var(--color-text-secondary)] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 p-4 rounded-lg bg-[var(--color-info)]/10 border border-[var(--color-info)]/20 text-sm text-[var(--color-text-secondary)] leading-relaxed">
      {children}
    </div>
  );
}

function FlagItem({
  color,
  name,
  children,
  className,
}: {
  color: string;
  name: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`w-5 h-5 rounded shrink-0 mt-0.5 ${className ?? ""}`}
        style={className ? undefined : { backgroundColor: color }}
      />
      <div>
        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
          {name}
        </h4>
        <p className="text-sm text-[var(--color-text-secondary)]">{children}</p>
      </div>
    </div>
  );
}

function TyreCard({
  color,
  name,
  desc,
}: {
  color: string;
  name: string;
  desc: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border-secondary)]">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
          {name}
        </span>
      </div>
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
