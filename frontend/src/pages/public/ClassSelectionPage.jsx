/**
 * ClassSelectionPage.jsx - Class Selection and Seat Quota Overview
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { useStudent } from '../../context/useStudent';
import { apiService } from '../../services/apiService';
import { ClassCard } from '../../components/common/ClassCard';
import {
  SearchIcon,
  CloseIcon,
  BookIcon,
  FilterIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from '../../components/common/Icons';
import { formatTimeRemaining } from '../../utils/formatters';

export function ClassSelectionPage() {
  const { studentId } = useStudent();

  const [classes, setClasses] = useState([]);
  const [studentSummary, setStudentSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');

  useEffect(() => {
    document.title = 'Explore Admission Classes | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Initial and reactive load via promise
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const [fetchedClasses, summary] = await Promise.all([
          apiService.getClasses(),
          studentId
            ? apiService.getStudentAdmissionSummary(studentId)
            : Promise.resolve({
                studentId: null,
                admissionState: 'NONE',
                currentApplication: null,
                canApply: true,
              }),
        ]);

        if (isMounted) {
          setClasses(fetchedClasses);
          setStudentSummary(summary);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  // 5-second silent background polling interval
  useEffect(() => {
    let isMounted = true;

    const pollData = async () => {
      try {
        const [fetchedClasses, summary] = await Promise.all([
          apiService.getClasses(),
          studentId
            ? apiService.getStudentAdmissionSummary(studentId)
            : Promise.resolve({
                studentId: null,
                admissionState: 'NONE',
                currentApplication: null,
                canApply: true,
              }),
        ]);

        if (isMounted) {
          setClasses(fetchedClasses);
          setStudentSummary(summary);
        }
      } catch (err) {
        console.error('Polling classes error:', err);
      }
    };

    const timer = setInterval(pollData, 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [studentId]);

  // Filtered classes computation
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (c.name || '').toLowerCase().includes(q);
        const groupMatch = (c.group || '').toLowerCase().includes(q);
        const gradeMatch = (c.grade || '').toLowerCase().includes(q);
        if (!nameMatch && !groupMatch && !gradeMatch) return false;
      }

      if (gradeFilter !== 'ALL') {
        if (c.grade !== gradeFilter) return false;
      }

      if (shiftFilter !== 'ALL') {
        const cShift = (c.shift || (/day/i.test(c.name) ? 'Day' : 'Morning')).toLowerCase();
        if (cShift !== shiftFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [classes, searchQuery, gradeFilter, shiftFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setGradeFilter('ALL');
    setShiftFilter('ALL');
  };

  return (
    <div className="admission-page-wrapper">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="admission-breadcrumbs mb-4">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Admission Classes</span>
        </div>

        {/* Global Student Application Restriction Banner */}
        {studentSummary?.admissionState === 'CONFIRMED' &&
          studentSummary.currentApplication && (
            <div className="alert alert-success mb-4">
              <div className="alert-icon">
                <CheckCircleIcon />
              </div>
              <div className="alert-body">
                <div>
                  <strong>Your admission has already been confirmed</strong> in{' '}
                  <span className="font-semibold">
                    {studentSummary.currentApplication.className}
                  </span>{' '}
                  (Application Code:{' '}
                  <code>
                    {studentSummary.currentApplication.applicationCode ||
                      studentSummary.currentApplication.holdId}
                  </code>
                  ).
                </div>
                <div className="alert-subtext">
                  Per Hashmat Uddin High School policy, confirmed students cannot apply to another class or shift.
                </div>
              </div>
              <div className="alert-actions">
                <Link
                  to={`/applications/${studentSummary.currentApplication.holdId}`}
                  className="btn btn-sm btn-outline"
                >
                  View Confirmed Admission
                </Link>
              </div>
            </div>
          )}

        {studentSummary?.admissionState === 'HELD' &&
          studentSummary.currentApplication && (
            <div className="alert alert-warning mb-4">
              <div className="alert-icon">
                <AlertTriangleIcon />
              </div>
              <div className="alert-body">
                <div>
                  <strong>You already have an active seat reservation</strong> in{' '}
                  <span className="font-semibold">
                    {studentSummary.currentApplication.className}
                  </span>
                  .
                </div>
                <div className="alert-subtext">
                  You must confirm or cancel your active reservation before selecting a different class or shift.
                </div>
              </div>
              <div className="alert-actions">
                <Link
                  to={`/applications/${studentSummary.currentApplication.holdId}`}
                  className="btn btn-sm btn-primary"
                >
                  View Current Reservation (
                  {studentSummary.currentApplication.remainingSeconds > 0
                    ? formatTimeRemaining(
                        studentSummary.currentApplication.remainingSeconds
                      )
                    : 'Active'}
                  )
                </Link>
              </div>
            </div>
          )}

        {/* Filter Controls Bar */}
        <div className="filter-bar-card mb-6">
          <div className="filter-controls-row">
            {/* Search Input */}
            <div className="filter-search-col">
              <div className="search-input-wrapper">
                <span className="search-icon">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  id="class-search-input"
                  className="form-control search-input"
                  placeholder="Search classes or groups (e.g. Class 6, Science)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    id="search-clear-btn"
                    className="search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <CloseIcon width={16} height={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Class / Grade Filter */}
            <div className="filter-select-col">
              <label htmlFor="grade-filter-select" className="sr-only">
                Filter by Class
              </label>
              <div className="select-wrapper">
                <span className="select-icon">
                  <BookIcon width={16} height={16} />
                </span>
                <select
                  id="grade-filter-select"
                  className="form-control form-select"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                >
                  <option value="ALL">All Classes (6–10)</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                </select>
              </div>
            </div>

            {/* Shift Filter */}
            <div className="filter-select-col">
              <label htmlFor="shift-filter-select" className="sr-only">
                Filter by Shift
              </label>
              <div className="select-wrapper">
                <span className="select-icon">
                  <FilterIcon width={16} height={16} />
                </span>
                <select
                  id="shift-filter-select"
                  className="form-control form-select"
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                >
                  <option value="ALL">All Shifts</option>
                  <option value="Morning">Morning Shift</option>
                  <option value="Day">Day Shift</option>
                </select>
              </div>
            </div>

            {/* Reset Action */}
            <div className="filter-action-col">
              <button
                type="button"
                id="btn-reset-filters"
                className="btn btn-secondary btn-reset-filters"
                title="Reset all filters"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="filter-results-meta">
            <span id="filter-count-label" className="text-muted text-sm">
              Showing {filteredClasses.length} of {classes.length} classes
            </span>
          </div>
        </div>

        {/* Class Cards Grid */}
        <div id="class-cards-grid" className="class-cards-grid">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="class-card skeleton-card">
                <div
                  className="skeleton-line"
                  style={{ width: '30%', height: '20px', marginBottom: '12px' }}
                ></div>
                <div
                  className="skeleton-line"
                  style={{ width: '70%', height: '28px', marginBottom: '24px' }}
                ></div>
                <div
                  className="skeleton-line"
                  style={{ width: '100%', height: '50px', marginBottom: '16px' }}
                ></div>
                <div
                  className="skeleton-line"
                  style={{ width: '100%', height: '12px', marginBottom: '24px' }}
                ></div>
                <div
                  className="skeleton-line"
                  style={{ width: '100%', height: '42px' }}
                ></div>
              </div>
            ))
          ) : filteredClasses.length === 0 ? (
            <div className="empty-state-box" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state-icon">
                <SearchIcon width={40} height={40} />
              </div>
              <h3 className="empty-state-title">No Matching Classes Found</h3>
              <p className="empty-state-description">
                Try adjusting your search query or removing the filters.
              </p>
              <div className="empty-state-actions">
                <button
                  type="button"
                  id="empty-reset-filters-btn"
                  className="btn btn-primary"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          ) : (
            filteredClasses.map((cls) => (
              <ClassCard
                key={cls.id}
                classItem={cls}
                studentState={studentSummary}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ClassSelectionPage;
