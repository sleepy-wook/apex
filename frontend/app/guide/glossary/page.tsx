"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Search } from "lucide-react";

interface Term {
  ko: string;
  en: string;
  desc: string;
  category: string;
}

const terms: Term[] = [
  // 레이싱 기본
  { ko: "그랑프리 (GP)", en: "Grand Prix", desc: "F1 시즌을 구성하는 개별 레이스를 의미합니다. 각 GP는 특정 서킷에서 개최되며, 한 시즌에 약 24개의 GP가 열립니다.", category: "기본" },
  { ko: "그리드", en: "Grid", desc: "레이스 출발 시 드라이버들이 서는 위치를 의미합니다. 퀄리파잉 결과에 따라 그리드 순서가 결정됩니다.", category: "기본" },
  { ko: "폴 포지션", en: "Pole Position", desc: "퀄리파잉에서 가장 빠른 랩타임을 기록한 드라이버에게 주어지는 1번 출발 위치입니다.", category: "기본" },
  { ko: "포뮬러", en: "Formula", desc: "모든 참가 차량이 따라야 하는 기술 규정을 의미합니다. F1의 'F'가 바로 이 포뮬러입니다.", category: "기본" },
  { ko: "컨스트럭터", en: "Constructor", desc: "F1에 참가하는 팀을 공식적으로 부르는 명칭입니다. 차량을 직접 설계하고 제작해야 컨스트럭터 자격이 주어집니다.", category: "기본" },
  { ko: "랩", en: "Lap", desc: "서킷을 한 바퀴 도는 것을 말합니다. 레이스는 정해진 랩 수 또는 시간 제한 내에 진행됩니다.", category: "기본" },
  { ko: "섹터", en: "Sector", desc: "서킷을 3등분한 구간입니다. 섹터별 시간을 비교해 드라이버의 강점/약점 구간을 분석할 수 있습니다.", category: "기본" },

  // 레이스 상태
  { ko: "DNF", en: "Did Not Finish", desc: "레이스를 완주하지 못한 상태입니다. 기계 고장, 사고, 전략적 리타이어 등의 이유가 있습니다.", category: "레이스 상태" },
  { ko: "DNS", en: "Did Not Start", desc: "레이스에 출발하지 못한 상태입니다. 차량 문제나 부상 등이 원인입니다.", category: "레이스 상태" },
  { ko: "DSQ", en: "Disqualified", desc: "규정 위반으로 실격 처리된 상태입니다. 기술 규정 위반, 연료량 초과 등이 원인이 될 수 있습니다.", category: "레이스 상태" },
  { ko: "세이프티카 (SC)", en: "Safety Car", desc: "사고 등 위험 상황에서 출동하는 선도 차량입니다. SC가 나오면 모든 차량은 SC 뒤에서 대열을 유지해야 하며, 추월이 금지됩니다.", category: "레이스 상태" },
  { ko: "버추얼 세이프티카 (VSC)", en: "Virtual Safety Car", desc: "실제 세이프티카 없이 속도 제한만 적용하는 방식입니다. 비교적 경미한 사고나 차량 수거 시 사용됩니다.", category: "레이스 상태" },
  { ko: "레드 플래그", en: "Red Flag", desc: "레이스가 완전히 중단되는 상황입니다. 심각한 사고, 악천후, 트랙 위 대형 파편 등이 원인입니다.", category: "레이스 상태" },

  // 기술 & 공학
  { ko: "DRS", en: "Drag Reduction System", desc: "뒷날개를 열어 공기 저항을 줄이는 시스템입니다. 앞 차와 1초 이내 간격에서만, 지정된 DRS 존에서 사용할 수 있습니다.", category: "기술" },
  { ko: "다운포스", en: "Downforce", desc: "차량을 트랙에 눌러붙게 하는 공기역학적 힘입니다. 다운포스가 클수록 코너링 속도가 빨라지지만, 직선 속도는 줄어듭니다.", category: "기술" },
  { ko: "슬립스트림", en: "Slipstream", desc: "앞 차 뒤에 바짝 붙어 공기 저항을 줄이는 주행 기법입니다. 직선에서 속도 이점을 얻어 추월에 활용합니다. 토우(Tow)라고도 합니다.", category: "기술" },
  { ko: "더티 에어", en: "Dirty Air", desc: "앞 차가 만든 난기류입니다. 뒤따르는 차량의 다운포스를 감소시켜 코너링 성능을 떨어뜨립니다.", category: "기술" },
  { ko: "포스드 인덕션 (터보)", en: "Turbo", desc: "F1은 1.6L V6 터보 하이브리드 파워 유닛을 사용합니다. 약 1,000마력의 출력을 냅니다.", category: "기술" },
  { ko: "ERS", en: "Energy Recovery System", desc: "제동 에너지(MGU-K)와 배기열 에너지(MGU-H)를 회수해 전기 에너지로 변환하는 하이브리드 시스템입니다.", category: "기술" },
  { ko: "파르크 페르메", en: "Parc Ferme", desc: "퀄리파잉 후부터 레이스 시작까지 차량 세팅 변경이 금지되는 규정입니다. 위반 시 피트레인 출발 페널티를 받습니다.", category: "기술" },

  // 타이어 & 피트
  { ko: "컴파운드", en: "Compound", desc: "타이어의 고무 혼합물 종류입니다. 소프트(빠르지만 마모 빠름), 미디엄(균형), 하드(느리지만 오래감) 3종류가 기본입니다.", category: "타이어" },
  { ko: "피트스탑", en: "Pit Stop", desc: "레이스 중 피트레인에 들어와 타이어 교체, 간단한 수리 등을 하는 것입니다. 보통 2~3초 만에 4개 타이어를 모두 교체합니다.", category: "타이어" },
  { ko: "스틴트", en: "Stint", desc: "한 세트의 타이어로 주행하는 구간을 의미합니다. 예를 들어 소프트로 15랩 주행 후 미디엄으로 교체하면, 첫 번째 스틴트는 15랩입니다.", category: "타이어" },
  { ko: "그레이닝", en: "Graining", desc: "타이어 표면이 과열되어 작은 고무 조각이 떨어져 나오는 현상입니다. 그립이 크게 감소합니다.", category: "타이어" },
  { ko: "디그래데이션", en: "Degradation", desc: "타이어 성능이 주행 중 점차 저하되는 것을 의미합니다. 마모와 열화가 주요 원인입니다.", category: "타이어" },
  { ko: "블리스터링", en: "Blistering", desc: "타이어 내부 온도가 과도하게 올라 표면에 물집 같은 손상이 생기는 현상입니다.", category: "타이어" },

  // 전략
  { ko: "언더컷", en: "Undercut", desc: "상대보다 먼저 피트스탑을 해서 새 타이어의 이점으로 앞서 나가는 전략입니다. F1에서 가장 흔한 추월 전략 중 하나입니다.", category: "전략" },
  { ko: "오버컷", en: "Overcut", desc: "상대보다 늦게 피트스탑을 하는 전략입니다. 앞 차가 피트인할 때 깨끗한 트랙에서 빠른 랩타임을 만들어 역전을 노립니다.", category: "전략" },
  { ko: "원스탑 / 투스탑", en: "One-stop / Two-stop", desc: "레이스 중 피트스탑 횟수에 따른 전략 구분입니다. 원스탑은 타이어 관리가 중요하고, 투스탑은 더 공격적인 페이스를 유지할 수 있습니다.", category: "전략" },
  { ko: "프리 스탑", en: "Free Stop", desc: "뒤따르는 차량과의 간격이 충분히 벌어져 피트스탑 후에도 순위를 잃지 않는 상황을 말합니다.", category: "전략" },

  // 기타
  { ko: "패스티스트 랩", en: "Fastest Lap", desc: "레이스 중 가장 빠른 단일 랩타임입니다. 상위 10위 안에서 패스티스트 랩을 기록하면 보너스 1점을 얻습니다.", category: "기타" },
  { ko: "포메이션 랩", en: "Formation Lap", desc: "레이스 시작 전 그리드 순서대로 서킷을 한 바퀴 도는 것입니다. 타이어와 브레이크를 워밍업합니다.", category: "기타" },
  { ko: "팀 오더", en: "Team Orders", desc: "팀이 드라이버에게 순위 교환이나 특정 행동을 지시하는 것입니다. 논란이 될 수 있지만, 현재 규정상 허용됩니다.", category: "기타" },
  { ko: "그래블 트랩", en: "Gravel Trap", desc: "서킷 이탈 시 차량을 감속시키기 위해 설치된 자갈 구간입니다.", category: "기타" },
  { ko: "마샬", en: "Marshal", desc: "트랙 주변에서 안전을 관리하는 요원입니다. 깃발 표시, 사고 수습, 파편 제거 등을 담당합니다.", category: "기타" },
];

const categories = ["전체", "기본", "레이스 상태", "기술", "타이어", "전략", "기타"];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");

  const filtered = useMemo(() => {
    return terms.filter((t) => {
      const matchesCategory =
        activeCategory === "전체" || t.category === activeCategory;
      if (!matchesCategory) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        t.ko.toLowerCase().includes(q) ||
        t.en.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="F1 용어사전"
        subtitle="F1에서 자주 쓰이는 용어들을 한국어로 쉽게 설명합니다"
        breadcrumbs={[
          { label: "가이드", href: "/guide" },
          { label: "용어사전" },
        ]}
      />

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        />
        <input
          type="text"
          placeholder="용어 검색 (한국어 또는 영어)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-hover)] transition-colors"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              activeCategory === cat
                ? "bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] border border-[var(--color-border-hover)]"
                : "text-[var(--color-text-tertiary)] border border-[var(--color-border-secondary)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border-primary)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-[var(--color-text-tertiary)] mb-4">
        {filtered.length}개 용어
      </p>

      {/* Terms list */}
      <div className="space-y-3">
        {filtered.map((term) => (
          <div
            key={term.en}
            className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]"
          >
            <div className="flex items-baseline gap-2 mb-1.5">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                {term.ko}
              </h3>
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
                {term.en}
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {term.desc}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]">
              {term.category}
            </span>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-[var(--color-text-tertiary)]">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
