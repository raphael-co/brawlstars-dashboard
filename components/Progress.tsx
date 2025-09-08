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
      className={`w-full h-3 rounded-full border-2 border-black bg-zinc-200 dark:bg-zinc-800 overflow-hidden shadow-[0_3px_0_rgba(0,0,0,0.5)] ${className}`}
    >
      <div
        className={`h-full transition-all duration-500 ease-out ${indicatorClassName}`}
        style={{
          width: `${v}%`,
        }}
      />
    </div>
  );
}
