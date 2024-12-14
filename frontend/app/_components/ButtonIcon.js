export default function ButtonIcon({ children, onClick }) {
  return (
    <button className='p-2 rounded-md hover:bg-primary-100' onClick={onClick}>
      {children}
    </button>
  );
}
