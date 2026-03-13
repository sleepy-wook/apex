import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "F1 즐기기 - 영화/다큐/시리즈 가이드 | APEX",
  description:
    "F1을 더 깊게 즐길 수 있는 영화, 다큐멘터리, 드라마를 소개합니다. Drive to Survive, Rush, Senna 등 필수 시청 콘텐츠.",
  openGraph: {
    title: "F1 즐기기 - 영화/다큐/시리즈 가이드 | APEX",
    description:
      "F1을 더 깊게 즐길 수 있는 영화, 다큐멘터리, 드라마 추천. 입문자부터 팬까지.",
  },
};

interface MediaItem {
  title: string;
  titleKo: string;
  year: string;
  type: "영화" | "다큐멘터리" | "시리즈" | "드라마";
  platform: string;
  desc: string;
  recommendation: string;
  highlight?: boolean;
}

const mediaItems: MediaItem[] = [
  {
    title: "F1",
    titleKo: "F1",
    year: "2025",
    type: "영화",
    platform: "극장 개봉",
    desc: "브래드 피트가 은퇴한 F1 드라이버로 복귀하는 이야기를 그린 영화입니다. 실제 F1 그랑프리 현장에서 촬영했으며, 한국에서 500만 관객을 돌파하며 F1 붐을 이끌었습니다.",
    recommendation: "F1에 입문하게 된 계기가 될 수 있는 영화. 실제 서킷과 팀 분위기를 생생하게 느낄 수 있습니다.",
    highlight: true,
  },
  {
    title: "Drive to Survive",
    titleKo: "본능의 질주: F1 스토리",
    year: "2019~",
    type: "시리즈",
    platform: "넷플릭스",
    desc: "매 F1 시즌의 비하인드 스토리를 다루는 다큐멘터리 시리즈입니다. 드라이버와 팀의 인간적인 면모, 정치적 암투, 드라마틱한 순간들을 생생하게 담았습니다.",
    recommendation: "한국 F1 붐의 주역. F1에 빠지는 가장 확실한 방법이며, 시즌 1부터 순서대로 보는 것을 추천합니다.",
    highlight: true,
  },
  {
    title: "Rush",
    titleKo: "러쉬: 더 라이벌",
    year: "2013",
    type: "영화",
    platform: "VOD",
    desc: "1976년 시즌, 제임스 헌트와 니키 라우다의 치열한 챔피언십 경쟁을 그린 영화입니다. 론 하워드 감독, 크리스 헴스워스 주연. 라우다의 뉘르부르크링 사고와 극적인 복귀를 다루고 있습니다.",
    recommendation: "F1 역사상 가장 드라마틱한 라이벌 관계를 다룬 명작. 영화적 완성도도 높아 F1을 모르는 사람에게도 추천.",
  },
  {
    title: "Senna",
    titleKo: "세나",
    year: "2010",
    type: "다큐멘터리",
    platform: "VOD",
    desc: "F1 역사상 가장 위대한 드라이버 중 한 명으로 꼽히는 아일톤 세나의 생애를 다룬 다큐멘터리입니다. 실제 레이스 영상과 인터뷰로 구성되어 있습니다.",
    recommendation: "F1의 전설을 만나볼 수 있는 다큐멘터리. 세나와 프로스트의 라이벌 관계, 그리고 비극적인 결말까지.",
  },
  {
    title: "Senna",
    titleKo: "세나 (드라마)",
    year: "2024",
    type: "드라마",
    platform: "넷플릭스",
    desc: "아일톤 세나의 생애를 드라마화한 미니시리즈입니다. 세나의 어린 시절부터 F1에서의 영광과 비극까지를 재현합니다.",
    recommendation: "다큐멘터리 세나를 먼저 보고, 드라마로 더 깊이 들어가 보세요.",
  },
  {
    title: "Schumacher",
    titleKo: "슈마허",
    year: "2021",
    type: "다큐멘터리",
    platform: "넷플릭스",
    desc: "F1 역대 최다 7회 월드 챔피언 미하엘 슈마허의 가족이 직접 참여한 다큐멘터리입니다. 그의 레이싱 커리어와 가족에 대한 이야기를 담고 있습니다.",
    recommendation: "페라리의 황금기를 이끈 전설적인 드라이버의 이야기. 가족의 시점에서 바라본 슈마허를 만날 수 있습니다.",
  },
  {
    title: "Williams",
    titleKo: "윌리엄스",
    year: "2017",
    type: "다큐멘터리",
    platform: "VOD",
    desc: "F1의 전설적인 팀 윌리엄스의 역사를 다룬 다큐멘터리입니다. 창립자 프랭크 윌리엄스 경의 이야기와 팀이 겪은 영광과 시련을 다루고 있습니다.",
    recommendation: "F1이 단순한 레이스가 아니라 인간의 도전과 열정의 이야기라는 것을 보여주는 작품.",
  },
  {
    title: "Gran Turismo",
    titleKo: "그란 투리스모",
    year: "2023",
    type: "영화",
    platform: "VOD",
    desc: "게임 그란 투리스모의 최고 플레이어가 실제 레이서가 되는 실화를 바탕으로 한 영화입니다. 닛산 GT 아카데미 프로그램을 통한 전 데이비드의 이야기를 다룹니다.",
    recommendation: "F1은 아니지만 모터스포츠의 매력을 느끼기에 좋은 영화. 게이머도 레이서가 될 수 있다는 꿈.",
  },
];

const typeColors: Record<string, string> = {
  영화: "#f59e0b",
  다큐멘터리: "#3b82f6",
  시리즈: "#22c55e",
  드라마: "#f97316",
};

export default function MediaPage() {
  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/guide" className="hover:text-foreground transition-colors">가이드</Link>
        <span>/</span>
        <span className="text-foreground">F1 즐기기</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-5 bg-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            F1 즐기기
          </h1>
        </div>
        <p className="text-muted-foreground ml-4">F1을 더 깊게 즐길 수 있는 영화, 다큐멘터리, 드라마</p>
      </div>

      <p className="text-muted-foreground mb-6 max-w-2xl">
        레이스가 없는 날에도 F1을 즐길 수 있는 방법은 많습니다.
        F1의 역사와 드라마를 담은 영화, 다큐멘터리, 시리즈를 소개합니다.
        입문자에게 추천하는 순서대로 정리했습니다.
      </p>

      <div className="space-y-4">
        {mediaItems.map((item, i) => (
          <div
            key={`${item.title}-${item.year}`}
            className={`rounded-lg border overflow-hidden ${
              item.highlight
                ? "bg-card border-primary/30"
                : "bg-card border-border"
            }`}
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-lg font-bold text-foreground">
                      {item.titleKo}
                    </h3>
                    {item.highlight && (
                      <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-700">
                        추천
                      </span>
                    )}
                  </div>
                  {item.titleKo !== item.title && (
                    <p className="text-xs text-muted-foreground">
                      {item.title}
                    </p>
                  )}
                </div>
                <span className="text-sm font-mono text-muted-foreground shrink-0">
                  {item.year}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className="px-2 py-0.5 text-xs font-medium rounded-full border"
                  style={{
                    color: typeColors[item.type],
                    borderColor: `color-mix(in srgb, ${typeColors[item.type]} 30%, transparent)`,
                    backgroundColor: `color-mix(in srgb, ${typeColors[item.type]} 10%, transparent)`,
                  }}
                >
                  {item.type}
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground border border-border">
                  {item.platform}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {item.desc}
              </p>

              {/* Recommendation */}
              <div className="p-3 rounded-md bg-muted">
                <span className="text-xs font-medium text-muted-foreground">
                  추천 이유
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.recommendation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional note */}
      <div className="mt-8 p-4 rounded-lg bg-muted border border-border">
        <p className="text-sm text-muted-foreground">
          여기 소개된 콘텐츠 외에도 F1을 즐기는 방법은 다양합니다.
          공식 F1 유튜브 채널에서 무료로 하이라이트 영상을 볼 수 있고,
          F1 공식 팟캐스트도 운영되고 있습니다. 한국어 F1 커뮤니티로는
          디시인사이드 F1 갤러리, 뽁스뽁스 등이 활발합니다.
        </p>
      </div>
    </div>
  );
}
