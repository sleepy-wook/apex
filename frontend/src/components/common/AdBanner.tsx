interface AdBannerProps {
  type: "leaderboard" | "mobile" | "sidebar"
}

export function AdBanner({ type }: AdBannerProps) {
  const dimensions = {
    leaderboard: { width: "728px", height: "90px" },
    mobile: { width: "100%", height: "100px" },
    sidebar: { width: "300px", height: "250px" },
  }

  const dim = dimensions[type]

  return (
    <div
      className="flex items-center justify-center bg-muted border border-border"
      style={{
        width: dim.width,
        height: dim.height,
        maxWidth: "100%",
      }}
    >
      <span className="text-[11px] tracking-wider uppercase text-muted-foreground/50">
        Advertisement
      </span>
    </div>
  )
}
