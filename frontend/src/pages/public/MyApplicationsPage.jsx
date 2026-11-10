/**
 * MyApplicationsPage.jsx - Development Placeholder (Part 2)
 * Hashmat Uddin High School Online Admission System
 */

import { useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeftIcon } from '../../components/common/Icons';

export function MyApplicationsPage() {
  useEffect(() => {
    document.title = 'My Applications | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="container py-8 my-8 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="alert alert-info mb-6" style={{ maxWidth: '640px', textAlign: 'left' }}>
        <div>
          <h2 className="font-bold text-lg mb-2">My Applications Hub</h2>
          <p className="text-sm">
            This module (Student application tracking, active reservations, historical records, and quick ID switching) is scheduled for implementation in <strong>Part 2</strong>.
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <Link to="/" className="btn btn-primary">
          <ArrowLeftIcon /> Return to Homepage
        </Link>
        <Link to="/admission-info" className="btn btn-secondary">
          View Admission Guidelines
        </Link>
      </div>
    </div>
  );
}

export default MyApplicationsPage;
