"use client";

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-[#020305]">
            {/* Dynamic Grid */}
            <div
                className="absolute inset-0 opacity-[0.25]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #1e293b 1px, transparent 1px),
            linear-gradient(to bottom, #1e293b 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                }}
            />

            {/* Ambient Glows */}
            <div className="absolute top-0 -left-1/4 w-3/4 h-3/4 bg-primary/20 rounded-full blur-[160px] animate-pulse" />
            <div className="absolute bottom-0 -right-1/4 w-3/4 h-3/4 bg-secondary/10 rounded-full blur-[160px] animate-pulse delay-700" />

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020305] via-transparent to-[#020305] opacity-60 pointer-events-none" />
        </div>
    );
}
