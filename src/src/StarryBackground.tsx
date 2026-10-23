import React, { useMemo } from 'react';

export const StarryBackground: React.FC = () => {
  // Generate deterministic stars
  const stars = useMemo(() => {
    const list = [];
    for (let i = 0; i < 70; i++) {
      const top = Math.sin(i * 997) * 50 + 50; // 0 to 100%
      const left = Math.cos(i * 613) * 50 + 50; // 0 to 100%
      const size = (i % 3 === 0 ? 2.5 : i % 2 === 0 ? 1.5 : 1);
      const delay = (i % 5) * 0.8;
      const duration = 2.5 + (i % 4) * 1.2;
      const isPurple = i % 7 === 0;

      list.push({
        id: i,
        top: `${Math.abs(top % 100)}%`,
        left: `${Math.abs(left % 100)}%`,
        size,
        delay: `${delay}s`,
        duration: `${duration}s`,
        isPurple,
      });
    }
    return list;
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Deep cosmic nebula gradients */}
      <div className="absolute -top-[20%] right-[10%] w-[550px] h-[550px] rounded-full bg-purple-900/15 blur-[120px] animate-nebula" />
      <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-950/20 blur-[140px] animate-nebula" style={{ animationDelay: '-6s' }} />
      <div className="absolute -bottom-[15%] right-[25%] w-[500px] h-[500px] rounded-full bg-fuchsia-950/15 blur-[130px] animate-nebula" style={{ animationDelay: '-3s' }} />

      {/* Grid line subtle cosmic mesh */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #a855f7 1px, transparent 1px), linear-gradient(to bottom, #a855f7 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Star points */}
      {stars.map((star) => (
        <span
          key={star.id}
          className={`absolute rounded-full animate-twinkle ${
            star.isPurple ? 'bg-purple-300 shadow-[0_0_8px_#c084fc]' : 'bg-slate-200 shadow-[0_0_4px_#ffffff]'
          }`}
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
};
