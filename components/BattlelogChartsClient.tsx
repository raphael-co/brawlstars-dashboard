"use client";

import { DACard } from '@/components/DACard'
import {
  ResultsPie,
  WinrateBars,
  ModeVolumeBars,
  RollingWinrateLine,
  DurationHistogram,
  HourWinrateBars,
  MapWinrateBars,
  TrophyDeltaArea, // <-- import du nouveau chart
} from '@/components/Charts'

type Props = {
  periodLabel?: string
  resultSplit: Array<{ name: string; value: number; key: 'victory' | 'defeat' | 'draw' }>
  modes: Array<{ mode: string; winrate: number; total: number }>
  maps: Array<{ map: string; winrate: number; total: number }>
  durations: number[]
  hours: Array<{ hour: number; winrate: number; total: number }>
  seqWR: Array<{ idx: number; wr: number }>
  deltaData: Array<{ x: number; delta: number; cumul: number }> // <-- NOUVEAU
}

export default function BattlelogChartsClient({
  periodLabel,
  resultSplit,
  modes,
  maps,
  durations,
  hours,
  seqWR,
  deltaData,
}: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DACard innerClassName="p-4 sm:p-5">
        <ResultsPie data={resultSplit} periodLabel={periodLabel} />
      </DACard>

      <DACard innerClassName="p-4 sm:p-5">
        <WinrateBars data={modes.map(m => ({ mode: m.mode, winrate: m.winrate }))} periodLabel={periodLabel} />
      </DACard>

      <DACard innerClassName="p-4 sm:p-5">
        <ModeVolumeBars data={modes.map(m => ({ mode: m.mode, total: m.total }))} periodLabel={periodLabel} />
      </DACard>

      <DACard innerClassName="p-4 sm:p-5">
        <RollingWinrateLine data={seqWR} periodLabel={periodLabel} />
      </DACard>

      <DACard innerClassName="p-4 sm:p-5 lg:col-span-2">
        <TrophyDeltaArea sampleLabel={`(dern. ${deltaData.length} parties)`} deltaData={deltaData} />
      </DACard>

      <DACard innerClassName="p-4 sm:p-5">
        <DurationHistogram data={durations} periodLabel={periodLabel} />
      </DACard>

      <DACard innerClassName="p-4 sm:p-5">
        <HourWinrateBars data={hours} periodLabel={periodLabel} />
      </DACard>

      {maps.length > 0 && (
        <DACard innerClassName="p-4 sm:p-5 lg:col-span-2">
          <MapWinrateBars data={maps.map(m => ({ map: m.map, winrate: m.winrate }))} periodLabel={periodLabel} />
        </DACard>
      )}
    </div>
  )
}
