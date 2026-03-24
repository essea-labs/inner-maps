'use client';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { container: 32, dot: 8, offset: 4 },
    md: { container: 40, dot: 10, offset: 5 },
    lg: { container: 52, dot: 13, offset: 7 },
  };
  const s = sizes[size];

  return (
    <div
      style={{
        width: s.container,
        height: s.container,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #E8A87C 0%, #D4845A 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: s.dot,
          height: s.dot,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)',
          position: 'absolute',
          top: s.offset,
          left: s.offset,
        }}
      />
      <div
        style={{
          width: s.dot * 0.7,
          height: s.dot * 0.7,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.5)',
          position: 'absolute',
          bottom: s.offset,
          right: s.offset,
        }}
      />
    </div>
  );
}
