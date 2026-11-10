/**
 * AuthorityStatisticsPage.jsx - Development Placeholder (Part 3)
 * Hashmat Uddin High School Online Admission System
 */

import { useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeftIcon } from '../../components/common/Icons';

export function AuthorityStatisticsPage() {
  useEffect(() => {
    document.title = 'Admission Statistics — Authority Portal | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="container py-8 my-8 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="alert alert-info mb-6" style={{ maxWidth: '640px', textAlign: 'left' }}>
        <div>
          <h2 className="font-bold text-lg mb-2">Admission Statistics &amp; Analytics</h2>
          <p className="text-sm">
            This module (Single-line metrics row, vertical 3-mode bar chart, and section summary cards) is scheduled for implementation in <strong>Part 3</strong>.
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <Link to="/authority/admission-management" className="btn btn-primary">
          <ArrowLeftIcon /> Return to Authority Dashboard
        </Link>
      </div>
    </div>
  );
}

export default AuthorityStatisticsPage;
