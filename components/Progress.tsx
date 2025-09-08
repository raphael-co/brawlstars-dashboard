"use client";

export function Progress({
  value,
  className = "",
  indicatorClassName = "",
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  const v = Math.max(0, Math.min(100, value));

  return (
    <div
      className={[
        "relative w-full h-3 rounded-full border-2 border-black overflow-hidden",
        "bg-zinc-200 dark:bg-zinc-800",
        "shadow-[0_3px_0_rgba(0,0,0,0.5)]",
        className,
      ].join(" ")}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={[
          "relative h-full transition-[width] duration-700 ease-out will-change-[width]",
          "shadow-[0_3px_0_rgba(0,0,0,0.45)]",
          indicatorClassName,
        ].join(" ")}
        style={{
          width: `${v}%`,
          background:
            "linear-gradient(90deg, #FCD34D 0%, #F59E0B 45%, #FB923C 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-30 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(120% 80% at 50% -20%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-1/3 -translate-x-full bs-shimmer rounded-[inherit]"
          style={{
            background:
              "linear-gradient(75deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
            filter: "brightness(1.1)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[55%] rounded-t-[inherit] opacity-35"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.15) 60%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2 rounded-b-[inherit]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)",
        }}
      />
      <style jsx>{`
        @keyframes bs-shimmer-move {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .bs-shimmer {
          animation: bs-shimmer-move 2.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
