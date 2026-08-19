'use client';

export function Loader({ fullPage = false }: { fullPage?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-8 ${
        fullPage ? 'fixed inset-0 z-50' : ''
      }`}
      style={{ backgroundColor: '#19396C' }}
    >
      <div className="animate-fade-in">
        <img
          src="/images/gislaine/logo-icon-only.webp"
          alt="Gislaine Lozano"
          width={64}
          height={64}
          className="h-16 w-16"
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <span
          className="text-lg tracking-[0.2em] uppercase"
          style={{
            fontFamily: 'var(--font-outfit), sans-serif',
            color: '#FFFFFF',
            fontWeight: 400,
          }}
        >
          Gislaine Lozano
        </span>
        <div
          className="w-48 h-[2px] rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(223,130,60,0.15)' }}
        >
          <div
            className="h-full rounded-full animate-loader-progress"
            style={{
              background: 'linear-gradient(90deg, #DF823C, #EF9648)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function LoaderInline({ size = 32 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size * 2, height: size * 2 }}
    >
      <div
        className="absolute rounded-full animate-ping"
        style={{
          width: size * 2,
          height: size * 2,
          background: 'radial-gradient(circle, rgba(223,130,60,0.2) 0%, transparent 70%)',
        }}
      />
      <div className="animate-spin-slow">
        <img
          src="/images/gislaine/logo-icon-only.webp"
          alt=""
          width={size}
          height={size}
          style={{ width: size, height: size }}
        />
      </div>
    </div>
  );
}
