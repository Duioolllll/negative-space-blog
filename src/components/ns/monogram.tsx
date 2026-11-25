export function Monogram({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="29" height="29" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="9" y="9" width="14" height="14" fill="currentColor" />
      <rect x="20" y="4" width="8" height="8" fill="#C8321E" />
    </svg>
  );
}
