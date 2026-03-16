import { ReactNode } from 'react';
import AppNavigation from './AppNavigation';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      {children}
    </div>
  );
};

export default AppLayout;
