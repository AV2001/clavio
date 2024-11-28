export default function Heading({ children, level = 1 }) {
  const Tag = `h${level}`;
  const sizeClasses = {
    1: 'text-4xl',
    2: 'text-3xl',
    3: 'text-2xl',
  };

  return (
    <Tag
      className={`${
        sizeClasses[level] || 'text-xl'
      } font-bold text-primary-900 mb-6`}
    >
      {children}
    </Tag>
  );
}
