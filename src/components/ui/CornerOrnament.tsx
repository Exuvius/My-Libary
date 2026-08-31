export function CornerOrnament() {
  const base = "absolute w-5 h-5 opacity-35 pointer-events-none";
  return (
    <>
      <span className={`${base} top-2 left-2 border-t-2 border-l-2 border-text-muted`} />
      <span className={`${base} top-2 right-2 border-t-2 border-r-2 border-text-muted`} />
      <span className={`${base} bottom-2 left-2 border-b-2 border-l-2 border-text-muted`} />
      <span className={`${base} bottom-2 right-2 border-b-2 border-r-2 border-text-muted`} />
    </>
  );
}
