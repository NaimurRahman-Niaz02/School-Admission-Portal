/**
 * AuthorityClassDetailsPage.jsx - Development Placeholder (Part 3)
 * Hashmat Uddin High School Online Admission System
 */

import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeftIcon } from '../../components/common/Icons';

export function AuthorityClassDetailsPage() {
  const { classId } = useParams();

  useEffect(() => {
    document.title = 'Class Roster Details — Authority Portal | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="container py-8 my-8 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="alert alert-info mb-6" style={{ maxWidth: '640px', textAlign: 'left' }}>
        <div>
          <h2 className="font-bold text-lg mb-2">Class Details &amp; Student Rosters ({classId})</h2>
          <p className="text-sm">
            This module (Admitted &amp; Reserved student rosters, financial revenue breakdown, and student profile modals) is scheduled for implementation in <strong>Part 3</strong>.
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <Link to="/authority/statistics" className="btn btn-primary">
          <ArrowLeftIcon /> Return to Statistics
        </Link>
      </div>
    </div>
  );
}

export default AuthorityClassDetailsPage;

