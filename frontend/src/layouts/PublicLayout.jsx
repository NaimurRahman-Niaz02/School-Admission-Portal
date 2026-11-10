/**
 * PublicLayout.jsx - Reusable Public Layout for Student Portal
 * Hashmat Uddin High School Online Admission System
 */

import { Outlet } from 'react-router';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { PublicFooter } from '../components/layout/PublicFooter';
import { StudentIdModal } from '../components/common/StudentIdModal';

export function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <main id="app-root" role="main">
        <Outlet />
      </main>
      <PublicFooter />
      <StudentIdModal />
    </>
  );
}

export default PublicLayout;

