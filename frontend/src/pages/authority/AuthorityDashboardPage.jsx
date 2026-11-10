/**
 * AuthorityDashboardPage.jsx - Development Placeholder (Part 3)
 * Hashmat Uddin High School Online Admission System
 */

import { useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeftIcon } from '../../components/common/Icons';

export function AuthorityDashboardPage() {
  useEffect(() => {
    document.title = 'Authority Dashboard Hub | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="container py-8 my-8 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="alert alert-info mb-6" style={{ maxWidth: '640px', textAlign: 'left' }}>
        <div>
          <h2 className="font-bold text-lg mb-2">Authority Dashboard Hub</h2>
          <p className="text-sm">
            This module (School capacity KPI rows, schedule updating modal, and administrative module launchpad) is scheduled for implementation in <strong>Part 3</strong>.
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <Link to="/" className="btn btn-primary">
          <ArrowLeftIcon /> View Public Homepage
        </Link>
      </div>
    </div>
  );
}

export default AuthorityDashboardPage;

