/**
 * PublicClassDetailsPage.jsx - Development Placeholder (Part 2)
 * Hashmat Uddin High School Online Admission System
 */

import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeftIcon } from '../../components/common/Icons';

export function PublicClassDetailsPage() {
  const { classId } = useParams();

  useEffect(() => {
    document.title = 'Class Details & Seat Reservation | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="container py-8 my-8 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="alert alert-info mb-6" style={{ maxWidth: '640px', textAlign: 'left' }}>
        <div>
          <h2 className="font-bold text-lg mb-2">Class Details &amp; Seat Reservation ({classId})</h2>
          <p className="text-sm">
            This module (Class quotas, live breakdown, 17-digit student input, and 10-minute hold initiation) is scheduled for implementation in <strong>Part 2</strong>.
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

export default PublicClassDetailsPage;
