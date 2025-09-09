/* eslint-disable @next/next/no-img-element */
import { getPlayer, getBrawlers, getCosmetics, getBrawlerAssets, isHttpError, HttpError } from "@/lib/brawl";
import { computeCompletion } from "@/lib/completion";
import { KPI } from "@/components/KPI";
import OwnedToggle from "@/components/OwnedToggle";
import CompareButton from "@/components/CompareButton";
import { AccountCompletion } from "@/components/AccountCompletion";
import { DACard } from "@/components/DACard";
import T from "@/components/T";
import { Lnk } from "@/components/Lnk";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const tagUp = String(tag ?? "").toUpperCase();

  let player: any | null = null;
  let brawlersData: any | null = null;
  let cosmetics: any[] | null = null;
  let assets:
    | {
        items: Array<{ id: number; name: string; imageUrl?: string | null; imageUrl2?: string | null }>;
      }
    | null = null;
  let comp:
    | {
        ownedBrawlers: number;
        totalBrawlers: number;
        brawlersCompletion: number;
        starPowersOwned: number;
        starPowersTotal: number;
        gadgetsOwned: number;
        gadgetsTotal: number;
        gearsOwned: number;
        gearsTotal: number;
      }
    | null = null;

  try {
    const [p, b, c, a] = await Promise.all([getPlayer(tagUp), getBrawlers(), getCosmetics(), getBrawlerAssets()]);

    player = p;
    brawlersData = b;
    cosmetics = Array.isArray(c) ? c : c?.items ?? [];
    assets = a ?? { items: [] };
    const brawlers = brawlersData?.items ?? [];
    comp = computeCompletion(player, brawlers);
  } catch (e) {
    const err = e as unknown;
    const renderDetails = (he: HttpError) => (
      <details className="mt-2 rounded-lg border border-white/20 bg-white/5 p-3 text-xs text-white/90">
        <summary className="cursor-pointer">
          <T k="errors.errorDetails" />
        </summary>
        <div className="mt-2 space-y-1">
          <div>
            <b>
              <T k="errors.status" />:
            </b>{" "}
            {he.status}
          </div>
          {he.code !== undefined && (
            <div>
              <b>
                <T k="errors.code" />:
              </b>{" "}
              {String(he.code)}
            </div>
          )}
          <div>
            <b>
              <T k="errors.message" />:
            </b>{" "}
            {he.message}
          </div>
          {he.url && (
            <div>
              <b>
                <T k="errors.url" />:
              </b>{" "}
              {he.url}
            </div>
          )}
          {he.body && (
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-black/50 p-2">
              {JSON.stringify(he.body, null, 2)}
            </pre>
          )}
        </div>
      </details>
    );

    return (
      <div className="space-y-4">
        <h1>
          <T k="player.title" /> #{tagUp}
        </h1>
        <div className="text-sm opacity-70">
          <T k="errors.loadingFailed" />
        </div>
        {isHttpError(err) ? (
          renderDetails(err as HttpError)
        ) : (
          <details className="mt-2 rounded-lg border border-white/20 bg-white/5 p-3 text-xs text-white/90">
            <summary className="cursor-pointer">
              <T k="errors.details" />
            </summary>
            <pre className="mt-2">{String(err)}</pre>
          </details>
        )}
      </div>
    );
  }

  const assetMap = new Map<number, string>(
    (assets?.items ?? [])
      .filter((x) => Number.isFinite((x as any)?.id))
      .map((x) => [Number(x.id), String(x.imageUrl2 || x.imageUrl || "")]),
  );
  const imgFor = (id: number) => {
    const u = assetMap.get(Number(id));
    return u && u.startsWith("http") ? u : undefined;
  };

  const all: any[] = brawlersData?.items ?? [];
  const ownedIds = new Set<number>((player?.brawlers ?? []).map((b: any) => Number(b.id)));
  const missing = all
    .filter((b: any) => !ownedIds.has(Number(b.id)))
    .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));

  return (
    <div className="space-y-8">
      {player && brawlersData && cosmetics && comp ? (
        <>
          <section className="relative gap-4 items-center w-full">
            <div className="relative md:col-span-2">
              <DACard>
                <div className="space-y-2 text-white">
                  <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
                    {player.name}{" "}
                    <span className="align-middle ml-1 inline-flex items-center rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_3px_0_#000]">
                      #{tagUp}
                    </span>
                  </h1>

                  <div className="opacity-90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                    <T k="player.level" /> {player.expLevel} • <T k="player.trophies" />:{" "}
                    <b className="font-extrabold">{player.trophies}</b> (<T k="player.highest" />: {player.highestTrophies})
                    {(() => {
                      const club = player?.club;
                      const cleanTag =
                        typeof club?.tag === "string" && club.tag.trim()
                          ? club.tag.replace(/^#/, "")
                          : null;

                      return club ? (
                        <span>
                          {" "}
                          • <T k="player.club" />:{" "}
                          <b className="font-extrabold">{club.name ?? "—"}</b>
                          {cleanTag && (
                            <>
                              {" "}
                              •{" "}
                              <Lnk
                                className="underline decoration-2 underline-offset-2 hover:opacity-90"
                                href={`/club/${encodeURIComponent(cleanTag)}`}
                              >
                                <T k="common.open" />
                              </Lnk>
                            </>
                          )}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div className="text-sm mt-2 flex gap-3">
                    <Lnk className="underline decoration-2 underline-offset-2" href={`/battlelog/${tagUp}`}>
                      <T k="battlelog.title" />
                    </Lnk>
                    <CompareButton
                      currentTag={tagUp}
                      defaultOpponentTag="GGUQJ28Q"
                      className="underline decoration-2 underline-offset-2 cursor-pointer"
                    />
                  </div>
                </div>
              </DACard>
            </div>
          </section>

          <section className="items-center">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
              <KPI label={<T k="player.kpi.trophies" />} value={player.trophies} sub={<T k="player.kpi.trophiesSub" />} />
              <KPI label={<T k="player.kpi.victories3v3" />} value={player["3vs3Victories"] ?? 0} />
              <KPI
                label={<T k="player.kpi.soloDuo" />}
                value={`${player.soloVictories ?? 0} / ${player.duoVictories ?? 0}`}
              />
            </div>
          </section>

          <AccountCompletion comp={comp} />

          <section className="space-y-3">
            <h2 className="text-white font-extrabold text-lg drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              <T k="player.yourBrawlers" />
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(player.brawlers ?? [])
                .slice()
                .sort((a: any, b: any) => b.trophies - a.trophies)
                .map((pb: any, i: number) => (
                  <DACard key={pb.id} delay={i * 0.05}>
                    <Lnk href={`/player/${tagUp}/brawler/${pb.id}`}>
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                          {imgFor(pb.id) ? (
                            <img
                              alt={pb.name}
                              src={imgFor(pb.id)!}
                              className="w-16 h-16 rounded-xl border-2 border-black object-cover bg-zinc-800"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl border-2 border-black bg-zinc-800 grid place-items-center text-white/70">
                              {pb.name?.[0] ?? "?"}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-white">
                            <div className="font-bold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">{pb.name}</div>
                            <div className="rounded-md border-2 border-black bg-gradient-to-b from-yellow-300 to-amber-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_3px_0_#000]">
                              <T k="brawler.rank" /> {pb.rank}
                            </div>
                          </div>
                          <div className="text-sm text-white/90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
                            <T k="brawler.trophies" />: {pb.trophies} • <T k="player.highest" />: {pb.highestTrophies} •{" "}
                            <T k="brawler.power" /> {pb.power}
                          </div>
                        </div>
                      </div>
                    </Lnk>
                  </DACard>
                ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-extrabold text-lg drop-shadow-[0_3px_0_rgba(0,0,0,0.8)]">
              <T k="player.missingBrawlers" /> ({missing.length})
            </h2>
            <p className="text-xs text-white/80">
              <T k="player.missingNote" />
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {missing.map((b: any, i: number) => (
                <DACard key={b.id} delay={i * 0.03}>
                  <Lnk href={`/player/${tagUp}/brawler/${b.id}`}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        {imgFor(b.id) ? (
                          <img
                            alt={b.name}
                            src={imgFor(b.id)!}
                            className="w-16 h-16 rounded-xl border-2 border-black object-cover bg-zinc-800"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl border-2 border-black bg-zinc-800 grid place-items-center text-white/70">
                            {b.name?.[0] ?? "?"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between text-white">
                          <div className="font-bold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">{b.name}</div>
                          <div className="rounded-md border-2 border-black bg-gradient-to-b from-zinc-200 to-zinc-400 px-2 py-0.5 text-xs font-extrabold text-black shadow-[0_3px_0_#000]">
                            <T k="common.nonOwned" />
                          </div>
                        </div>
                        <div className="text-sm text-white/90">
                          <b className="font-extrabold">
                            <T k="brawler.starPowers" />:
                          </b>{" "}
                          {b.starPowers?.map((s: any) => s.name).join(", ") || "—"}
                        </div>
                        <div className="text-sm text-white/90">
                          <b className="font-extrabold">
                            <T k="brawler.gadgets" />:
                          </b>{" "}
                          {b.gadgets?.map((g: any) => g.name).join(", ") || "—"}
                        </div>
                      </div>
                    </div>
                  </Lnk>
                </DACard>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div>
          <T k="loading.data" />
        </div>
      )}
    </div>
  );
}

function SkinsList({ cosmetics }: { cosmetics: any }) {
  if (!cosmetics) return <div className="opacity-70"><T k="common.unavailable" /></div>;
  const skins: any[] = cosmetics;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {skins.slice(0, 60).map((skin, i) => (
        <DACard key={skin.id} delay={i * 0.04}>
          <div className="flex items-center justify-between text-white">
            <div className="font-bold drop-shadow-[0_2px_0_rgba(0,0,0,0.7)]">{skin.name}</div>
            <OwnedToggle skinId={skin.id} />
          </div>
          {skin.imageUrl && <img alt={skin.name} src={skin.imageUrl} className="rounded-xl border-2 border-black" />}
          <div className="text-xs text-white/80 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)]">
            {skin.brawler?.name ?? <T k="brawler.unknown" />}
          </div>
        </DACard>
      ))}
    </div>
  );
}
