// Shows a user's photo if they have one, otherwise their first initial.
// Reuses the existing .doctor-avatar styling by default.
export default function Avatar({ src, name = '', className = 'doctor-avatar' }) {
  if (src) {
    return (
      <img
        className={className}
        src={src}
        alt={name}
        style={{ objectFit: 'cover' }}
      />
    );
  }
  return <div className={className}>{name.charAt(0)}</div>;
}
