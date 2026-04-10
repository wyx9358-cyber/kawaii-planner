export function ProgressRing({ value, color, label = "本周进度" }: { value: number; color: string; label?: string }) {
  const percentage = Math.max(0, Math.min(100, value));
  return (
    <div className="relative h-24 w-24 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `conic-gradient(${color} ${percentage * 3.6}deg, rgba(255,255,255,0.55) 0deg)` }}
      />
      <div className="absolute inset-[10px] flex items-center justify-center rounded-full bg-white/85 text-center shadow-inner">
        <div>
          <div className="text-lg font-bold">{percentage}%</div>
          <div className="text-[10px] text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  );
}
