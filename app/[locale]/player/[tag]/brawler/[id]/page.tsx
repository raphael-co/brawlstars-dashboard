import { getPlayer, getBrawlers, getBattleLog, getBrawlerAssets, getBrawlerSkinsViaProxy } from "@/lib/brawl";
import BrawlerCharts from "@/components/BrawlerCharts";
import { DACard } from "@/components/DACard";
import { Progress } from "@/components/Progress";
import T from "@/components/T";
import { Lnk } from "@/components/Lnk";
import { Key, ReactElement, JSXElementConstructor, ReactNode, AwaitedReactNode, ReactPortal } from "react";

type PlayerBrawler = {
  id: number;
  name: string;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
  starPowers: Array<{
    id: number;
    name: string;
  }>;
  gadgets: Array<{ id: number; name: string }>;
  gears?: Array<{ id: number; name: string }>;
};

type SkinLite = {
  id: number;
  name: string;
  imageUrl: string | null;
  rarity: string | null;
  limited: boolean;
};

function diffById<T extends { name: any; id: number }>(owned: T[] | undefined, all: T[] | undefined) {
  const o = new Set((owned ?? []).map((i) => i.id));
  const a = all ?? [];
  const missing = a.filter((i) => !o.has(i.id));
  const ownedClean = a.filter((i) => o.has(i.id));
  return { owned: ownedClean, missing };
}

function pct(a: number, b: number) {
  if (!b) return "0%";
  return `${Math.round((a / b) * 100)}%`;
}

type BattleItem = {
  battle?: {
    mode?: string;
    result?: "victory" | "defeat" | "draw";
    trophyChange?: number;
    duration?: number;
    teams?: Array<Array<{ tag: string; name: string; brawler?: { id?: number; name?: string } }>>;
    players?: Array<{ tag: string; name: string; brawler?: { id?: number; name?: string } }>;
  };
  event?: { mode?: string; map?: string };
  battleTime?: string;
};

function parseBattleTime(t?: string) {
  if (!t) return 0;
  const d = Date.parse(t);
  return Number.isNaN(d) ? 0 : d;
}

function filterBrawlerBattles(items: BattleItem[], playerTagUp: string, brawlerId: number) {
  const out: BattleItem[] = [];
  for (const it of items) {
    const teamsFlat = (it.battle?.teams?.flat?.() ?? []) as Array<{ tag?: string; brawler?: { id?: number } }>;
    const players = (it.battle?.players ?? []) as Array<{ tag?: string; brawler?: { id?: number } }>;
    const participants = teamsFlat.length ? teamsFlat : players;
    if (!participants?.length) continue;
    const me = participants.find((p) => p.tag?.replace(/^#/, "")?.toUpperCase() === playerTagUp);
    if (!me) continue;
    const id = me.brawler?.id;
    if (typeof id === "number" && id === brawlerId) out.push(it);
  }
  return out;
}

function computePerBrawlerStats(items: BattleItem[]) {
  const total = items.length;
  let wins = 0;
  let draws = 0;
  let trophyDeltaSum = 0;
  const perMode = new Map<string, { w: number; t: number }>();
  let streak = 0;
  let current = 0;

  const chronological = [...items].sort((a, b) => parseBattleTime(a.battleTime) - parseBattleTime(b.battleTime));
  for (const it of chronological) {
    const r = it.battle?.result;
    if (r === "victory") current = current >= 0 ? current + 1 : 1;
    else if (r === "defeat") current = current <= 0 ? current - 1 : -1;
    else current = 0;
    streak = Math.abs(current) > Math.abs(streak) ? current : streak;
  }

  for (const it of items) {
    const mode = it.battle?.mode ?? it.event?.mode ?? "unknown";
    const res = it.battle?.result;
    const delta = it.battle?.trophyChange ?? 0;
    trophyDeltaSum += delta;
    if (!perMode.has(mode)) perMode.set(mode, { w: 0, t: 0 });
    const m = perMode.get(mode)!;
    m.t += 1;
    if (res === "victory") {
      wins += 1;
      m.w += 1;
    } else if (res === "draw") {
      draws += 1;
    }
  }

  const winrate = total ? Math.round((wins / total) * 100) : 0;
  const avgDelta = total ? Math.round((trophyDeltaSum / total) * 10) / 10 : 0;
  const byMode = Array.from(perMode.entries())
    .map(([mode, { w, t }]) => ({ mode, winrate: Math.round((w / Math.max(1, t)) * 100), games: t }))
    .sort((a, b) => b.games - a.games);

  const streakLabel = streak === 0 ? "—" : streak > 0 ? `W${streak}` : `L${Math.abs(streak)}`;

  const recentSorted = [...items].sort((a, b) => parseBattleTime(a.battleTime) - parseBattleTime(b.battleTime));
  let cumul = 0;
  const recentResults = recentSorted.map((it, i) => ({
    idx: i + 1,
    result: it.battle?.result ?? "draw",
    mode: it.battle?.mode ?? it.event?.mode ?? "unknown",
  }));
  const recentDelta = recentSorted.map((it, i) => {
    const d = it.battle?.trophyChange ?? 0;
    cumul += d;
    return { idx: i + 1, delta: d, cumul, mode: it.battle?.mode ?? it.event?.mode ?? "unknown" };
  });

  return { total, wins, draws, winrate, trophyDeltaSum, avgDelta, byMode, streakLabel, recentResults, recentDelta };
}

function buildPeriodLabel(items: BattleItem[]) {
  if (!items.length) return "—";
  const times = items.map((i) => parseBattleTime(i.battleTime)).filter(Boolean);
  if (!times.length) return `${items.length} parties`;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const spanMs = Math.max(0, max - min);
  const hours = spanMs / 3.6e6;
  const labelTime = hours < 36 ? `~${Math.max(1, Math.round(hours))} h` : `~${Math.max(1, Math.round(hours / 24))} j`;
  return `${labelTime} • ${items.length} parties`;
}

export default async function PlayerBrawlerPage({
  params,
}: {
  params: Promise<{ tag: string; id: string }>;
}) {
  const { tag, id } = await params;
  const tagUp = tag.toUpperCase();
  const brawlerId = Number(id);
  const skins = await getBrawlerSkinsViaProxy(brawlerId);

  const [player, brawlersData, battlelog, assets] = await Promise.all([
    getPlayer(tagUp),
    getBrawlers(),
    getBattleLog(tagUp),
    getBrawlerAssets(),
  ]);

  const assetMap = new Map<number, string>(
    (assets?.items ?? [])
      .filter((x: any) => Number.isFinite(x?.id))
      .map((x: any) => [Number(x.id), String(x.imageUrl2 || x.imageUrl || "")]),
  );
  const imgFor = (id: number) => {
    const u = assetMap.get(Number(id));
    return u && u.startsWith("http") ? u : undefined;
  };

  const all = brawlersData.items;
  const master = all.find((b: any) => b.id === brawlerId);
  const pb: PlayerBrawler | undefined = player.brawlers.find((b: any) => b.id === brawlerId) as any;

  if (!master) throw new Error(`Brawler ${id} introuvable dans la base.`);

  const ownedSP = diffById(pb?.starPowers as any, master.starPowers as any);
  const ownedG = diffById(pb?.gadgets as any, master.gadgets as any);
  const ownedGears = pb?.gears ?? [];
  const gearsInfo = { owned: ownedGears.length, total: Math.max(ownedGears.length, 2) };

  const stats = {
    power: pb?.power ?? 0,
    rank: pb?.rank ?? 0,
    trophies: pb?.trophies ?? 0,
    highestTrophies: pb?.highestTrophies ?? 0,
    starPowersOwned: ownedSP.owned.length,
    starPowersTotal: master.starPowers?.length ?? 0,
    gadgetsOwned: ownedG.owned.length,
    gadgetsTotal: master.gadgets?.length ?? 0,
    gearsOwned: gearsInfo.owned,
    gearsTotal: gearsInfo.total,
  };

  const filtered = filterBrawlerBattles((battlelog.items ?? []) as BattleItem[], tagUp, brawlerId);
  const last20 = filtered.sort((a, b) => parseBattleTime(b.battleTime) - parseBattleTime(a.battleTime)).slice(0, 20);

  const adv = computePerBrawlerStats(last20);
  const periodLabel = buildPeriodLabel(last20);

  return (
    <div className="space-y-8">
      <section className="relative gap-4 w-full">
        <DACard>
          <div className="flex items-center gap-4 text-white justify-between">
            <div className="shrink-0">
              {imgFor(master.id) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgFor(master.id)!}
                  alt={master.name}
                  className="w-16 h-16 rounded-2xl border-2 border-black object-cover bg-zinc-800"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl border-2 border-black bg-zinc-800 grid place-items-center text-white/70">
                  {master.name?.[0] ?? "?"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
                {player.name} • {master.name}{" "}
                <span className="align-middle ml-1 inline-flex items-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_3px_0_#000]">
                  #{tagUp}
                </span>
              </h1>

              {pb ? (
                <div className="opacity-90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                  <T k="brawler.trophies" />: <b className="font-extrabold">{stats.trophies}</b> (
                  <T k="player.highest" />: {stats.highestTrophies}) • <T k="brawler.rank" />{" "}
                  <b className="font-extrabold">{stats.rank}</b> • <T k="brawler.power" />{" "}
                  <b className="font-extrabold">{stats.power}</b>
                </div>
              ) : (
                <div className="opacity-90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                  <T k="brawler.notOwned" />
                </div>
              )}
            </div>
            <div className="text-sm text-white/90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
              <Lnk className="underline decoration-2 underline-offset-2 hover:opacity-90" href={`/player/${tagUp}`}>
                <T k="common.seeProfile" />
              </Lnk>
            </div>
          </div>
        </DACard>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <DACard innerClassName="space-y-2">
          <div className="flex items-center justify-between text-white">
            <div className="font-bold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
              <T k="brawler.starPowers" />
            </div>
            <div className="text-sm text-white/80 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
              {stats.starPowersOwned} / {stats.starPowersTotal} ({pct(stats.starPowersOwned, stats.starPowersTotal)})
            </div>
          </div>
          <Progress value={Math.round((stats.starPowersOwned / Math.max(1, stats.starPowersTotal)) * 100)} />
          <SubList owned={ownedSP.owned.map((i) => i.name)} missing={ownedSP.missing.map((i) => i.name)} />
        </DACard>

        <DACard innerClassName="space-y-2">
          <div className="flex items-center justify-between text-white">
            <div className="font-bold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
              <T k="brawler.gadgets" />
            </div>
            <div className="text-sm text-white/80 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
              {stats.gadgetsOwned} / {stats.gadgetsTotal} ({pct(stats.gadgetsOwned, stats.gadgetsTotal)})
            </div>
          </div>
          <Progress value={Math.round((stats.gadgetsOwned / Math.max(1, stats.gadgetsTotal)) * 100)} />
          <SubList owned={ownedG.owned.map((i) => i.name)} missing={ownedG.missing.map((i) => i.name)} />
        </DACard>

        <DACard innerClassName="space-y-2">
          <div className="flex items-center justify-between text-white">
            <div className="font-bold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
              <T k="brawler.gearsEquipped" />
            </div>
            <div className="text-sm text-white/80 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
              {stats.gearsOwned} / {stats.gearsTotal} ({pct(stats.gearsOwned, stats.gearsTotal)})
            </div>
          </div>
          <Progress value={Math.round((stats.gearsOwned / Math.max(1, stats.gearsTotal)) * 100)} />
          {ownedGears?.length ? (
            <ul className="text-sm text-white/90 list-disc pl-4">
              {ownedGears.map((g) => (
                <li key={g.id}>{g.name}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-white/70">
              <T k="brawler.noGearsOwned" />
            </div>
          )}
        </DACard>
      </section>

      <DACard innerClassName="p-4 sm:p-5">
        <div className="text-sm text-white/90">
          <T k="brawler.resultsPrefix" /> <b>{last20.length}</b> <T k="brawler.resultsSuffix" /> <b>{master.name}</b> —{" "}
          <T k="common.period" />{" "}
          <span className="ml-1 rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-1.5 py-0.5 text-[11px] font-black text-black shadow-[0_2px_0_#000]">
            {periodLabel}
          </span>
        </div>
      </DACard>

      <section className="grid md:grid-cols-3 gap-4">
        <DACard innerClassName="space-y-2">
          <h2 className="text-white text-xl font-extrabold drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
            <T k="brawler.recentPerformance" /> (<T k="brawler.last" /> {adv.total})
          </h2>
          <div className="text-sm text-white/90">
            <T k="brawler.winrate" />: <b className="text-yellow-300">{adv.winrate}%</b> • <T k="brawler.draws" />:{" "}
            <b>{adv.draws}</b>
          </div>
          <div className="text-sm text-white/90">
            <T k="brawler.trophyDeltaTotal" />:{" "}
            <b>
              {adv.trophyDeltaSum >= 0 ? "+" : ""}
              {adv.trophyDeltaSum}
            </b>{" "}
            • <T k="brawler.avgPerGame" />:{" "}
            <b>
              {adv.avgDelta >= 0 ? "+" : ""}
              {adv.avgDelta}
            </b>
          </div>
          <div className="text-sm text-white/90">
            <T k="brawler.streak" />: <b>{adv.streakLabel}</b>
          </div>
        </DACard>

        <DACard innerClassName="space-y-2">
          <h3 className="text-white font-extrabold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
            <T k="brawler.winrateByMode" />
          </h3>
          {adv.byMode.length ? (
            <ul className="text-sm text-white/90 space-y-1">
              {adv.byMode.map((m) => (
                <li key={m.mode} className="flex justify-between">
                  <span>
                    {m.mode} ({m.games})
                  </span>
                  <span className="font-semibold">{m.winrate}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-white/70">—</div>
          )}
        </DACard>

        <DACard innerClassName="space-y-2">
          <h3 className="text-white font-extrabold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">
            <T k="brawler.quickRecap" />
          </h3>
          <ul className="text-sm text-white/90 space-y-1">
            <li>
              <T k="brawler.wins" />: <b>{adv.wins}</b> / {adv.total}
            </li>
            <li>
              <T k="brawler.bestModeSample" />: <b>{adv.byMode[0]?.mode ?? "—"}</b>
            </li>
            <li>
              <T k="brawler.recentResults" />:{" "}
              <b>{adv.recentResults.slice(-5).map((r) => r.result[0].toUpperCase()).join(" ") || "—"}</b>
            </li>
          </ul>
        </DACard>
      </section>

      <BrawlerCharts recentResults={adv.recentResults} recentDelta={adv.recentDelta} />

      {skins.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(skins as SkinLite[]).map((sk) => (
            <div key={sk.id} className="rounded-xl border-2 border-black bg-white/5 p-2">
              {sk.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sk.imageUrl}
                  alt={sk.name}
                  className="w-full aspect-square rounded-lg border-2 border-black object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="aspect-square rounded-lg border-2 border-black bg-white/10" />
              )}

              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-xs text-white/90 font-semibold truncate">{sk.name}</div>
                <div className="flex items-center gap-1">
                  {sk.rarity && (
                    <span className="rounded-md border-2 border-black bg-gradient-to-b from-zinc-200 to-zinc-400 px-1.5 py-0.5 text-[10px] font-black text-black shadow-[0_2px_0_#000]">
                      {sk.rarity}
                    </span>
                  )}
                  {sk.limited && (
                    <span className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-1.5 py-0.5 text-[10px] font-black text-black shadow-[0_2px_0_#000]">
                      Limited
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-white/70">Aucun skin trouvé pour ce brawler.</div>
      )}
    </div>
  );
}

function SubList({ owned, missing }: { owned: string[]; missing: string[] }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2 text-sm">
      <div>
        <div className="text-white/75 mb-1">
          <T k="common.ownedPlural" />
        </div>
        {owned.length ? (
          <ul className="text-white/90 list-disc pl-4">{owned.map((n) => <li key={n}>{n}</li>)}</ul>
        ) : (
          <div className="text-white/70">—</div>
        )}
      </div>
      <div>
        <div className="text-white/75 mb-1">
          <T k="common.missingPlural" />
        </div>
        {missing.length ? (
          <ul className="text-white/90 list-disc pl-4">{missing.map((n) => <li key={n}>{n}</li>)}</ul>
        ) : (
          <div className="text-white/70">—</div>
        )}
      </div>
    </div>
  );
}
