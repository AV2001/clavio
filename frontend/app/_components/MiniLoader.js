export default function MiniLoader({ className = '' }) {
  return (
    <div
      className={`inline-block animate-spin rounded-full w-4 h-4 border-2 border-solid border-white border-r-transparent ${className}`}
      role='status'
    ></div>
  );
}
