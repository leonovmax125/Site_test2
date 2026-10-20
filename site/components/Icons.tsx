export function Arrow({ diagonal = false }: { diagonal?: boolean }) { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
export function Mark({ className = "" }: { className?: string }) { return <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 42V23M24 31C10 31 6 20 7 8c12 0 18 10 17 23ZM24 24C24 11 33 5 43 5c0 12-7 21-19 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
export function ServiceShape({ type }: { type: string }) { return <svg viewBox="0 0 88 88" width="88" height="88" fill="none" aria-hidden="true">
  {type === "circle" && <><circle cx="38" cy="44" r="25" /><circle cx="50" cy="44" r="25" /></>}
  {type === "wave" && <>{[24,38,52,66].map(y => <path key={y} d={`M12 ${y}C26 ${y-18} 30 ${y+18} 44 ${y}S62 ${y-18} 76 ${y}`} />)}</>}
  {type === "leaf" && <><path d="M18 70C5 38 30 14 72 15c1 40-26 65-54 55Z" /><path d="m18 70 45-45M31 57V35m0 22h22" /></>}
  {type === "sun" && <><circle cx="44" cy="44" r="17" />{Array.from({length:12},(_,i) => <path key={i} d="M44 8v10" transform={`rotate(${i*30} 44 44)`} />)}</>}
</svg>; }
