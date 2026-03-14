import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Library, Users, Film } from "lucide-react";

export const metadata: Metadata = {
  title: "F1 입문 가이드 | APEX",
  description:
    "F1을 처음 접하는 분들을 위한 입문 가이드. 기본 규칙, 용어사전, 팀 소개, 추천 콘텐츠까지 한눈에 확인하세요.",
  openGraph: {
    title: "F1 입문 가이드 | APEX",
    description:
      "F1을 처음 접하는 분들을 위한 입문 가이드. 기본 규칙, 용어사전, 팀 소개, 추천 콘텐츠까지 한눈에.",
  },
};

const guides = [
  {
    href: "/guide/basics",
    icon: BookOpen,
    title: "기본 규칙",
    desc: "F1이 뭔지, 시즌은 어떻게 진행되는지, 포인트 시스템과 깃발 규칙까지",
  },
  {
    href: "/guide/glossary",
    icon: Library,
    title: "용어사전",
    desc: "DRS, 언더컷, 세이프티카 등 F1 용어를 한국어로 쉽게 설명",
  },
  {
    href: "/guide/teams",
    icon: Users,
    title: "팀 소개",
    desc: "F1 10개 팀의 역사, 드라이버, 최근 성적 한눈에 보기",
  },
  {
    href: "/guide/media",
    icon: Film,
    title: "F1 즐기기",
    desc: "F1을 더 깊게 즐길 수 있는 영화, 다큐멘터리, 드라마 추천",
  },
];

export default function GuidePage() {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
        F1 입문 가이드
      </h1>
      <p className="text-muted-foreground mb-8">
        F1을 처음 접하시나요? 여기서부터 시작하세요.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {guides.map((g) => {
          const Icon = g.icon;
          return (
            <Link
              key={g.href}
              href={g.href}
              className="group block p-5 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon
                  size={20}
                  className="text-muted-foreground group-hover:text-foreground transition-colors"
                />
                <h2 className="text-lg font-semibold text-foreground">
                  {g.title}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {g.desc}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
