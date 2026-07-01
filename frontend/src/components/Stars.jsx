// Read-only star display for a rating like 4.3 → ★★★★☆
export default function Stars({ value = 0 }) {
  const full = Math.round(value);
  return (
    <span style={{ color: '#f59e0b', letterSpacing: '1px' }} aria-label={`${value} out of 5`}>
      {'★'.repeat(full)}
      <span style={{ color: 'var(--border)' }}>{'★'.repeat(5 - full)}</span>
    </span>
  );
}
