import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "F1 용어사전 | APEX",
  description:
    "DRS, 언더컷, 오버컷, 세이프티카, 피트스탑 등 F1 용어를 한국어로 쉽게 설명합니다. 입문자를 위한 F1 용어 가이드.",
  openGraph: {
    title: "F1 용어사전 | APEX",
    description:
      "F1 용어를 한국어로 쉽게 설명합니다. DRS, 언더컷, 세이프티카 등 필수 용어 총정리.",
  },
};

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
