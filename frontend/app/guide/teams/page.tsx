import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "2024 F1 팀 소개 | APEX",
  description:
    "2024 F1 시즌 10개 팀을 소개합니다. 레드불, 맥라렌, 페라리, 메르세데스 등 각 팀의 역사, 드라이버, 최근 성적을 확인하세요.",
  openGraph: {
    title: "2024 F1 팀 소개 | APEX",
    description:
      "2024 F1 시즌 10개 팀 소개. 각 팀의 역사, 드라이버, 최근 성적 한눈에 보기.",
  },
};

interface Team {
  name: string;
  fullName: string;
  color: string;
  drivers: string[];
  base: string;
  powerUnit: string;
  championships: number;
  desc: string;
  recentForm: string;
}

const teams: Team[] = [
  {
    name: "Red Bull Racing",
    fullName: "Oracle Red Bull Racing",
    color: "var(--color-team-redbull)",
    drivers: ["막스 페르스타펜", "세르히오 페레즈"],
    base: "밀턴 킨스, 영국",
    powerUnit: "Honda RBPT",
    championships: 6,
    desc: "2010~2013년 페텔과 함께 4연패를 달성한 후, 2021년부터 페르스타펜의 시대를 열었습니다. 에이드리안 뉴이의 천재적 디자인 철학으로 유명하며, 에너지 드링크 브랜드의 레이싱 팀이라는 독특한 배경을 가지고 있습니다.",
    recentForm: "2022~2023년 압도적 우승, 2024년 컨스트럭터 3위로 하락하며 맥라렌과 페라리에 밀림",
  },
  {
    name: "McLaren",
    fullName: "McLaren Formula 1 Team",
    color: "var(--color-team-mclaren)",
    drivers: ["란도 노리스", "오스카 피아스트리"],
    base: "워킹, 영국",
    powerUnit: "Mercedes",
    championships: 8,
    desc: "F1 역사에서 가장 성공적인 팀 중 하나로, 아일톤 세나, 알랭 프로스트, 미카 하키넨, 루이스 해밀턴 등 전설적인 드라이버들이 거쳐 갔습니다. 파파야 오렌지 컬러가 트레이드마크입니다.",
    recentForm: "2024년 시즌 중반부터 급격한 성장을 보여주며 컨스트럭터 챔피언십 1위 달성",
  },
  {
    name: "Ferrari",
    fullName: "Scuderia Ferrari HP",
    color: "var(--color-team-ferrari)",
    drivers: ["샤를 르클레르", "카를로스 사인츠"],
    base: "마라넬로, 이탈리아",
    powerUnit: "Ferrari",
    championships: 16,
    desc: "F1 창설 때부터 참가한 유일한 팀으로, 가장 많은 컨스트럭터 챔피언십(16회)을 보유하고 있습니다. '스쿠데리아'는 이탈리아어로 '마굿간'이라는 뜻이며, 빨간색 차량은 F1의 상징 그 자체입니다.",
    recentForm: "2024년 시즌 후반부 강한 퍼포먼스를 보여주며 컨스트럭터 2위 달성",
  },
  {
    name: "Mercedes",
    fullName: "Mercedes-AMG PETRONAS F1 Team",
    color: "var(--color-team-mercedes)",
    drivers: ["루이스 해밀턴", "조지 러셀"],
    base: "브랙클리, 영국",
    powerUnit: "Mercedes",
    championships: 8,
    desc: "2014~2021년 8시즌 연속 컨스트럭터 챔피언이라는 전무후무한 기록을 세웠습니다. 루이스 해밀턴과 함께 역대 최다 우승 기록을 세웠으며, 토토 볼프 단장의 리더십이 유명합니다.",
    recentForm: "2024년 경쟁력을 회복하며 다수의 우승을 기록, 컨스트럭터 4위",
  },
  {
    name: "Aston Martin",
    fullName: "Aston Martin Aramco F1 Team",
    color: "var(--color-team-astonmartin)",
    drivers: ["페르난도 알론소", "랜스 스트롤"],
    base: "실버스톤, 영국",
    powerUnit: "Mercedes",
    championships: 0,
    desc: "영국의 럭셔리 자동차 브랜드가 운영하는 팀으로, 2021년 레이싱 포인트에서 리브랜딩했습니다. 레전드 드라이버 페르난도 알론소를 영입하고, 에이드리안 뉴이를 기술 총괄로 데려오며 장기적 성장을 도모하고 있습니다.",
    recentForm: "2023년 시즌 초반 강세 후, 2024년에는 중위권에서 고전",
  },
  {
    name: "Alpine",
    fullName: "BWT Alpine F1 Team",
    color: "var(--color-team-alpine)",
    drivers: ["피에르 가슬리", "에스테반 오콘"],
    base: "엔스톤, 영국 / 비리-샤티용, 프랑스",
    powerUnit: "Renault",
    championships: 2,
    desc: "르노의 프리미엄 스포츠카 브랜드 이름을 달고 참전하는 팀입니다. 전신인 르노 팀 시절 2005~2006년 페르난도 알론소와 함께 2연패를 달성했습니다.",
    recentForm: "2024년 시즌 하위권에서 경쟁, 팀 구조 개편 진행 중",
  },
  {
    name: "Williams",
    fullName: "Williams Racing",
    color: "var(--color-team-williams)",
    drivers: ["알렉산더 알본", "로건 사전트"],
    base: "그로브, 영국",
    powerUnit: "Mercedes",
    championships: 9,
    desc: "1977년 창단 이래 9회의 컨스트럭터 챔피언십을 차지한 명문 팀입니다. 나이젤 만셀, 알랭 프로스트, 데이먼 힐 등이 활약했으며, 최근에는 하위권에서 재건을 추진하고 있습니다.",
    recentForm: "2024년 하위권이지만 알본을 중심으로 점진적 발전 중",
  },
  {
    name: "RB",
    fullName: "Visa Cash App RB F1 Team",
    color: "var(--color-team-rb)",
    drivers: ["유키 츠노다", "다니엘 리카르도"],
    base: "파엔차, 이탈리아",
    powerUnit: "Honda RBPT",
    championships: 0,
    desc: "레드불의 세컨드 팀으로, 젊은 드라이버를 육성하는 역할을 합니다. 이전에는 알파타우리(AlphaTauri), 토로 로소(Toro Rosso)라는 이름으로 활동했습니다.",
    recentForm: "2024년 중하위권에서 경쟁, 츠노다의 꾸준한 성장이 돋보임",
  },
  {
    name: "Kick Sauber",
    fullName: "Stake F1 Team Kick Sauber",
    color: "var(--color-team-kick)",
    drivers: ["발테리 보타스", "저우 관위"],
    base: "힌빌, 스위스",
    powerUnit: "Ferrari",
    championships: 0,
    desc: "1993년부터 F1에 참전한 스위스 팀입니다. 2026년부터 아우디(Audi)가 인수하여 공장 팀으로 전환될 예정이며, 이를 위한 대규모 투자가 진행 중입니다.",
    recentForm: "2024년 최하위권, 아우디 전환을 앞둔 과도기",
  },
  {
    name: "Haas",
    fullName: "MoneyGram Haas F1 Team",
    color: "var(--color-team-haas)",
    drivers: ["니코 휠켄베르그", "케빈 마그누센"],
    base: "캐너폴리스, 미국",
    powerUnit: "Ferrari",
    championships: 0,
    desc: "2016년에 참전을 시작한 미국 팀입니다. CNC 공작기계 기업 하스 오토메이션의 진 하스가 설립했으며, 페라리와 긴밀한 기술 파트너십을 유지하고 있습니다.",
    recentForm: "2024년 중하위권, 시즌 중반 좋은 모습을 보이기도 함",
  },
];

export default function TeamsPage() {
  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/guide" className="hover:text-foreground transition-colors">가이드</Link>
        <span>/</span>
        <span className="text-foreground">팀 소개</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-5 bg-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            2024 시즌 팀 소개
          </h1>
        </div>
        <p className="text-muted-foreground ml-4">Formula 1을 구성하는 10개 팀을 소개합니다</p>
      </div>

      <div className="space-y-4">
        {teams.map((team) => (
          <div
            key={team.name}
            className="rounded-lg bg-card border border-border overflow-hidden"
          >
            {/* Team color accent bar */}
            <div
              className="h-1"
              style={{ backgroundColor: team.color }}
            />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {team.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {team.fullName}
                  </p>
                </div>
                {team.championships > 0 && (
                  <span className="shrink-0 px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700 border border-amber-200">
                    {team.championships}x Champion
                  </span>
                )}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <InfoItem label="드라이버" value={team.drivers.join(", ")} />
                <InfoItem label="본사" value={team.base} />
                <InfoItem label="파워 유닛" value={team.powerUnit} />
                <InfoItem
                  label="컨스트럭터 챔피언"
                  value={team.championships > 0 ? `${team.championships}회` : "-"}
                />
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {team.desc}
              </p>

              {/* Recent form */}
              <div className="p-3 rounded-md bg-muted">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  최근 성적
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {team.recentForm}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm text-foreground mt-0.5">{value}</p>
    </div>
  );
}
