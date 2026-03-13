import { AdBanner } from "./AdBanner";

interface AdSlotProps {
  className?: string;
}

export function AdSlot({ className = "" }: AdSlotProps) {
  return (
    <div className={`py-6 sm:py-8 ${className}`}>
      <div className="hidden md:flex justify-center">
        <AdBanner type="leaderboard" />
      </div>
      <div className="md:hidden">
        <AdBanner type="mobile" />
      </div>
    </div>
  );
}
