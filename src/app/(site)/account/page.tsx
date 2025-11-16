import type { Metadata } from 'next';
import { AccountDashboard } from '@/features/account/components/AccountDashboard';

export const metadata: Metadata = {
  title: 'BROKS · Личный кабинет',
  description: 'Управляйте профилем, избранными объектами и черновиками объявлений в личном кабинете BROKS.',
};

export default function AccountPage() {
  return <AccountDashboard />;
}
