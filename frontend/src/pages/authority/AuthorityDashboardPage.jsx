/**
 * AuthorityDashboardPage.jsx - Central Administrative Hub & Capacity KPIs
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { apiService } from '../../services/apiService';
import { useToast } from '../../context/useToast';
import { UpdateAdmissionTimeModal } from '../../components/modals/UpdateAdmissionTimeModal';
import { formatDhms } from '../../utils/formatters';

export function AuthorityDashboardPage() {
  const { showToast } = useToast();

  const [timeline, setTimeline] = useState({
    startDate: '2026-11-01T08:00:00.000Z',
    endDate: '2026-11-30T23:59:59.000Z',
  });
  const [summary, setSummary] = useState({
    totalClasses: 0,
    totalCapacity: 0,
    totalConfirmed: 0,
    totalHeld: 0,
    totalAvailable: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [clockInfo, setClockInfo] = useState({
    title: 'Session 2027 Admission Closes In:',
    digits: 'Calculating schedule...',
  });

  useEffect(() => {
    document.title = 'Authority Dashboard | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const formatFullDate = (isoStr) => {
    try {
      const d = new Date(isoStr);
      const opts = {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      return d.toLocaleString('en-US', opts);
    } catch {
      return isoStr;
    }
  };

  const loadData = useCallback(async (isInitial = false) => {
    try {
      const [fetchedTimeline, fetchedSummary] = await Promise.all([
        apiService.getAdmissionTimeline(),
        apiService.getAuthoritySummary(),
      ]);

      if (fetchedTimeline) setTimeline(fetchedTimeline);
      if (fetchedSummary) setSummary(fetchedSummary);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const [fetchedTimeline, fetchedSummary] = await Promise.all([
          apiService.getAdmissionTimeline(),
          apiService.getAuthoritySummary(),
        ]);
        if (isMounted) {
          if (fetchedTimeline) setTimeline(fetchedTimeline);
          if (fetchedSummary) setSummary(fetchedSummary);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Initial dashboard fetch error:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, []);

  // 5-second polling interval
  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const fetchedSummary = await apiService.getAuthoritySummary();
        if (isMounted && fetchedSummary) {
          setSummary(fetchedSummary);
        }
      } catch (err) {
        console.error('Polling dashboard summary error:', err);
      }
    };

    const timer = setInterval(poll, 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // 1-second admission schedule countdown ticker
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const start = new Date(timeline.startDate).getTime();
      const end = new Date(timeline.endDate).getTime();

      if (now < start) {
        setClockInfo({
          title: 'Session 2027 Admission Starts In:',
          digits: formatDhms(start - now),
        });
      } else if (now >= start && now <= end) {
        setClockInfo({
          title: 'Session 2027 Admission Closes In:',
          digits: formatDhms(end - now),
        });
      } else {
        setClockInfo({
          title: 'Session 2027 Admission Schedule:',
          digits: 'Admission Window Closed',
        });
      }
    };

    updateCountdown();
    const clockTimer = setInterval(updateCountdown, 1000);
    return () => clearInterval(clockTimer);
  }, [timeline]);

  const handleSaveTimeline = async (newTimeline) => {
    try {
      const res = await apiService.updateAdmissionTimeline(newTimeline);
      if (res.timeline) {
        setTimeline(res.timeline);
      }
      showToast('Admission schedule updated for Session 2027.', 'success');
      loadData(false);
    } catch (err) {
      showToast(err.message || 'Failed to update schedule.', 'error');
      throw err;
    }
  };

  return (
    <div className="authority-portal-wrapper">
      <div className="container authority-body">
        {/* 1. Top Section */}
        <div className="authority-top-hero">
          <div className="hero-header-left">
            <h1 className="landing-hero-title font-bold">Admission Year 2027</h1>
            <div className="hero-live-clock-box">
              <div className="clock-label-row">
                <span className="timer-dot-pulse"></span>
                <span className="clock-status-text" id="admin-timer-title">
                  {clockInfo.title}
                </span>
              </div>
              <div
                className="clock-digits font-mono"
                id="admin-admission-clock"
              >
                {clockInfo.digits}
              </div>
            </div>
          </div>

          <div className="hero-header-right">
            <div className="admin-dates-panel">
              <div className="admin-date-row">
                <span className="admin-date-label">Admission Start Date</span>
                <span
                  className="admin-date-value font-semibold"
                  id="admin-hero-start-date"
                >
                  {formatFullDate(timeline.startDate)}
                </span>
              </div>
              <div className="admin-date-divider"></div>
              <div className="admin-date-row">
                <span className="admin-date-label">Admission Closing Date</span>
                <span
                  className="admin-date-value font-semibold text-danger"
                  id="admin-hero-end-date"
                >
                  {formatFullDate(timeline.endDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Stat Section */}
        <div className="metrics-grid" id="authority-landing-metrics">
          <div className="metric-card">
            <span className="metric-label">Active Classes</span>
            <span className="metric-val" id="hub-metric-classes">
              {isLoading ? '—' : summary.totalClasses}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Total Seat Capacity</span>
            <span className="metric-val text-primary" id="hub-metric-seats">
              {isLoading ? '—' : summary.totalCapacity}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Admitted Students</span>
            <span className="metric-val text-teal" id="hub-metric-confirmed">
              {isLoading ? '—' : summary.totalConfirmed}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Active Holds (Pending)</span>
            <span className="metric-val text-amber" id="hub-metric-held">
              {isLoading ? '—' : summary.totalHeld}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Available Seats</span>
            <span
              className="metric-val text-emerald font-bold"
              id="hub-metric-available"
            >
              {isLoading ? '—' : summary.totalAvailable}
            </span>
          </div>
        </div>

        {/* 3. Activity Section */}
        <div className="hub-modules-grid" id="authority-interactive-actions">
          {/* 1. Create New Classes */}
          <div className="hub-module-card interactive-card">
            <h3 className="module-title">Create New Classes</h3>
            <div className="module-footer">
              <Link
                to="/authority/create-class"
                className="btn btn-primary btn-block"
              >
                Create
              </Link>
            </div>
          </div>

          {/* 2. Admission Statistics */}
          <div className="hub-module-card interactive-card">
            <h3 className="module-title">Admission Statistics</h3>
            <div className="module-footer">
              <Link
                to="/authority/statistics"
                className="btn btn-outline btn-block"
              >
                View
              </Link>
            </div>
          </div>

          {/* 3. Update Admission Time */}
          <div className="hub-module-card interactive-card">
            <h3 className="module-title">Update Admission Time</h3>
            <div className="module-footer">
              <button
                type="button"
                className="btn btn-outline btn-block"
                id="btn-interactive-update-time"
                onClick={() => setIsTimeModalOpen(true)}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Configuration Modal */}
      <UpdateAdmissionTimeModal
        isOpen={isTimeModalOpen}
        currentTimeline={timeline}
        onClose={() => setIsTimeModalOpen(false)}
        onSave={handleSaveTimeline}
      />
    </div>
  );
}

export default AuthorityDashboardPage;
