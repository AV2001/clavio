import SettingsHeader from './SettingsHeader';

export default async function SettingsLayout({ children }) {
  return (
    <div className='space-y-6'>
      <SettingsHeader />
      {children}
    </div>
  );
}
