import { HeroSection } from "@/components/home/HeroSection"
import { RaceResults } from "@/components/home/RaceResults"
import { DriverStandings } from "@/components/home/DriverStandings"
import { ConstructorStandings } from "@/components/home/ConstructorStandings"
import { AdBanner } from "@/components/common/AdBanner"
import {
  getSeasons,
  getRaces,
  getRaceSummary,
  getRaceResults,
  getDriverStandings,
  getConstructorStandings,
} from "@/lib/api"

export const revalidate = 3600 // 1시간 ISR

export default async function Home() {
  let year = new Date().getFullYear()
  try {
    const seasonsData = await getSeasons()
    if (seasonsData.seasons.length > 0) {
      year = seasonsData.seasons[0]
    }
  } catch {
    // fallback to current year
  }

  // Fetch latest race data
  let summary = null
  let results: Awaited<ReturnType<typeof getRaceResults>>["results"] = []
  let driverStandings: Awaited<ReturnType<typeof getDriverStandings>>["standings"] = []
  let constructorStandings: Awaited<ReturnType<typeof getConstructorStandings>>["standings"] = []

  try {
    const racesData = await getRaces(year)
    const completedRaces = racesData.races.filter((r) => r.winner_name)
    const latestRace = completedRaces[completedRaces.length - 1]

    if (latestRace) {
      const [summaryData, resultsData] = await Promise.all([
        getRaceSummary(year, latestRace.round),
        getRaceResults(year, latestRace.round),
      ])
      summary = summaryData
      results = resultsData.results
    }
  } catch {
    // API unavailable — show empty state
  }

  try {
    const [driverData, constructorData] = await Promise.all([
      getDriverStandings(year),
      getConstructorStandings(year),
    ])
    driverStandings = driverData.standings
    constructorStandings = constructorData.standings
  } catch {
    // API unavailable
  }

  const podium = results.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection summary={summary} podium={podium} year={year} />

      {/* Ad Banner - Leaderboard */}
      <div className="hidden md:flex justify-center py-8 border-b border-border">
        <AdBanner type="leaderboard" />
      </div>

      {/* Ad Banner - Mobile */}
      <div className="md:hidden px-6 py-6 border-b border-border">
        <AdBanner type="mobile" />
      </div>

      {/* Race Results */}
      <RaceResults results={results} summary={summary} year={year} />

      {/* Driver Standings */}
      <DriverStandings standings={driverStandings} year={year} />

      {/* Ad Banner */}
      <div className="border-y border-border">
        <div className="hidden md:flex justify-center py-8">
          <AdBanner type="leaderboard" />
        </div>
        <div className="md:hidden px-6 py-6">
          <AdBanner type="mobile" />
        </div>
      </div>

      {/* Constructor Standings */}
      <ConstructorStandings standings={constructorStandings} year={year} />

      {/* Final Ad Banner */}
      <div className="border-t border-border">
        <div className="hidden md:flex justify-center py-8">
          <AdBanner type="leaderboard" />
        </div>
        <div className="md:hidden px-6 py-6">
          <AdBanner type="mobile" />
        </div>
      </div>
    </div>
  )
}
