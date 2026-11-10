/**
 * AuthorityStatisticsPage.jsx - Multi-Dimensional Analytics and Section Quota Inspection
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { apiService } from '../../services/apiService';

// Curated vibrant color palette for vertical bars
const BAR_PALETTE = [
  {
    gradient: 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)',
    text: '#1d4ed8',
    glow: 'rgba(37, 99, 235, 0.25)',
  },
  {
    gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
    text: '#047857',
    glow: 'rgba(5, 150, 105, 0.25)',
  },
  {
    gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
    text: '#b45309',
    glow: 'rgba(217, 119, 6, 0.25)',
  },
  {
    gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)',
    text: '#6d28d9',
    glow: 'rgba(124, 58, 237, 0.25)',
  },
  {
    gradient: 'linear-gradient(180deg, #f472b6 0%, #e11d48 100%)',
    text: '#be123c',
    glow: 'rgba(225, 29, 72, 0.25)',
  },
  {
    gradient: 'linear-gradient(180deg, #2dd4bf 0%, #0d9488 100%)',
    text: '#0f766e',
    glow: 'rgba(13, 148, 136, 0.25)',
  },
];

export function AuthorityStatisticsPage() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chartOption, setChartOption] = useState('class'); // 'class' | 'shift' | 'groups'

  useEffect(() => {
    document.title = 'Admission Statistics — Authority Portal | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const data = await apiService.getAuthoritySummary();
        if (isMounted) {
          setSummary(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
        if (isMounted) {
          setIsLoading(false);
        }
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
        const data = await apiService.getAuthoritySummary();
        if (isMounted) {
          setSummary(data);
        }
      } catch (err) {
        console.error('Polling statistics error:', err);
      }
    };

    const timer = setInterval(poll, 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const classes = useMemo(() => summary?.classes || [], [summary]);

  // Compute Total Revenue Estimate
  const totalRevenue = useMemo(() => {
    let rev = 0;
    for (const c of classes) {
      const classFee =
        c.fee ||
        (c.grade === 'Class 9' || c.grade === 'Class 10' ? 1800 : 1500);
      rev += (c.confirmedSeats || 0) * classFee;
    }
    return rev;
  }, [classes]);

  // Dynamic Chart Data based on current option
  const chartData = useMemo(() => {
    if (chartOption === 'shift') {
      const morningClasses = classes.filter((c) =>
        /morning/i.test(c.shift || c.name)
      );
      const dayClasses = classes.filter((c) =>
        /day/i.test(c.shift || c.name)
      );

      const morningTotal = morningClasses.reduce(
        (s, c) => s + (c.totalSeats || 0),
        0
      );
      const morningConfirmed = morningClasses.reduce(
        (s, c) => s + (c.confirmedSeats || 0),
        0
      );
      const morningPct =
        morningTotal > 0
          ? Math.round((morningConfirmed / morningTotal) * 100)
          : 0;

      const dayTotal = dayClasses.reduce(
        (s, c) => s + (c.totalSeats || 0),
        0
      );
      const dayConfirmed = dayClasses.reduce(
        (s, c) => s + (c.confirmedSeats || 0),
        0
      );
      const dayPct =
        dayTotal > 0 ? Math.round((dayConfirmed / dayTotal) * 100) : 0;

      return [
        {
          label: 'Morning Shift',
          confirmed: morningConfirmed,
          total: morningTotal,
          pct: morningPct,
          color: {
            gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
            text: '#b45309',
            glow: 'rgba(217, 119, 6, 0.25)',
          },
        },
        {
          label: 'Day Shift',
          confirmed: dayConfirmed,
          total: dayTotal,
          pct: dayPct,
          color: {
            gradient: 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)',
            text: '#1d4ed8',
            glow: 'rgba(37, 99, 235, 0.25)',
          },
        },
      ];
    }

    if (chartOption === 'groups') {
      const groupConfigs = [
        {
          grade: 'Class 9',
          group: 'Science',
          label: 'Class 9 — Science',
          colorIndex: 0,
        },
        {
          grade: 'Class 9',
          group: 'Commerce',
          label: 'Class 9 — Commerce',
          colorIndex: 1,
        },
        {
          grade: 'Class 9',
          group: 'Arts',
          label: 'Class 9 — Arts',
          colorIndex: 2,
        },
        {
          grade: 'Class 10',
          group: 'Science',
          label: 'Class 10 — Science',
          colorIndex: 3,
        },
        {
          grade: 'Class 10',
          group: 'Commerce',
          label: 'Class 10 — Commerce',
          colorIndex: 5,
        },
        {
          grade: 'Class 10',
          group: 'Arts',
          label: 'Class 10 — Arts',
          colorIndex: 4,
        },
      ];

      return groupConfigs.map((item) => {
        const matching = classes.filter((c) => {
          const matchGrade =
            c.grade === item.grade ||
            (c.name && c.name.startsWith(item.grade));
          const grp = (c.group || '').toLowerCase();
          let matchGroup;
          if (item.group === 'Arts') {
            matchGroup = grp.includes('art') || grp.includes('humanities');
          } else if (item.group === 'Commerce') {
            matchGroup = grp.includes('commerce') || grp.includes('business');
          } else {
            matchGroup = grp.includes(item.group.toLowerCase());
          }
          return matchGrade && matchGroup;
        });

        const total = matching.reduce((s, c) => s + (c.totalSeats || 0), 0);
        const confirmed = matching.reduce(
          (s, c) => s + (c.confirmedSeats || 0),
          0
        );
        const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

        return {
          label: item.label,
          confirmed,
          total,
          pct,
          color: BAR_PALETTE[item.colorIndex % BAR_PALETTE.length],
        };
      });
    }

    // Default: 'class' (Classes 6-10)
    const grades = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    return grades.map((grade, idx) => {
      const matching = classes.filter(
        (c) => c.grade === grade || (c.name && c.name.startsWith(grade))
      );
      const total = matching.reduce((s, c) => s + (c.totalSeats || 0), 0);
      const confirmed = matching.reduce(
        (s, c) => s + (c.confirmedSeats || 0),
        0
      );
      const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

      return {
        label: grade,
        confirmed,
        total,
        pct,
        color: BAR_PALETTE[idx % BAR_PALETTE.length],
      };
    });
  }, [classes, chartOption]);

  if (isLoading) {
    return (
      <div className="authority-portal-wrapper">
        <div className="container authority-body">
          <div className="page-breadcrumbs stats-page-breadcrumbs mb-6">
            <Link to="/authority/admission-management">Dashboard</Link> /{' '}
            <span>Admission Statistics</span>
          </div>
          <div className="skeleton-line" style={{ width: '100%', height: '300px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="authority-portal-wrapper">
      <div className="container authority-body">
        {/* Breadcrumbs */}
        <div className="page-breadcrumbs stats-page-breadcrumbs mb-6">
          <Link to="/authority/admission-management">Dashboard</Link> /{' '}
          <span>Admission Statistics</span>
        </div>

        <div id="stats-page-content" className="mt-4">
          {/* 1. Stat Boxes in a Single Line */}
          <div className="metrics-grid stats-metrics-row mb-8">
            <div className="metric-card">
              <span className="metric-label">Active Classes</span>
              <span className="metric-val text-primary font-bold">
                {summary?.totalClasses || 0}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Total Capacity</span>
              <span className="metric-val font-bold">
                {summary?.totalCapacity || 0}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Admitted Students</span>
              <span className="metric-val text-teal font-bold">
                {summary?.totalConfirmed || 0}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Active Holds</span>
              <span className="metric-val text-amber font-bold">
                {summary?.totalHeld || 0}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Available Seats</span>
              <span className="metric-val text-emerald font-bold">
                {summary?.totalAvailable || 0}
              </span>
            </div>
            <div className="metric-card highlight-revenue">
              <span className="metric-label">Estimated Revenue</span>
              <span className="metric-val text-emerald font-mono font-bold">
                ৳{totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 2. Interactive Vertical Bar Chart Section */}
          <div className="authority-card stats-chart-card mb-10">
            <div className="card-header-styled stats-chart-header">
              <div>
                <h3
                  className="card-title-styled"
                  style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}
                >
                  Admission Analytics
                </h3>
                <p
                  className="card-subtitle-styled"
                  style={{
                    margin: '2px 0 0',
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  Live student enrollment capacity and quota occupancy
                </p>
              </div>

              <div className="stats-chart-selector-box">
                <label htmlFor="stats-chart-selector" className="sr-only">
                  Analytics View
                </label>
                <select
                  id="stats-chart-selector"
                  className="form-control form-select"
                  value={chartOption}
                  onChange={(e) => setChartOption(e.target.value)}
                >
                  <option value="class">
                    Admitted % of Total Seat (By Class)
                  </option>
                  <option value="shift">
                    Distribution Based on Shifts
                  </option>
                  <option value="groups">
                    Discipline Groups (Class 9 &amp; 10)
                  </option>
                </select>
              </div>
            </div>

            <div
              className="card-body stats-chart-body-padded p-6"
              id="stats-chart-body"
            >
              <div className="v-barchart-wrapper">
                <div className="v-barchart-stage">
                  {/* Horizontal Gridlines */}
                  <div className="v-barchart-grid">
                    <div className="v-grid-line">
                      <span className="v-grid-label">100%</span>
                      <div className="v-grid-rule"></div>
                    </div>
                    <div className="v-grid-line">
                      <span className="v-grid-label">75%</span>
                      <div className="v-grid-rule"></div>
                    </div>
                    <div className="v-grid-line">
                      <span className="v-grid-label">50%</span>
                      <div className="v-grid-rule"></div>
                    </div>
                    <div className="v-grid-line">
                      <span className="v-grid-label">25%</span>
                      <div className="v-grid-rule"></div>
                    </div>
                    <div className="v-grid-line">
                      <span className="v-grid-label">0%</span>
                      <div className="v-grid-rule baseline"></div>
                    </div>
                  </div>

                  {/* Vertical Bars Columns */}
                  <div className="v-barchart-bars">
                    {chartData.map((item, idx) => {
                      const color =
                        item.color || BAR_PALETTE[idx % BAR_PALETTE.length];
                      const pct = item.pct;
                      const countLabel = `${item.confirmed} / ${item.total}`;
                      const heightPct = Math.max(pct, 3);

                      return (
                        <div key={item.label} className="v-bar-col">
                          {/* Floating Stat Tag */}
                          <div className="v-bar-top-stat">
                            <span className="v-stat-count font-mono">
                              {countLabel}
                            </span>
                            <span
                              className="v-stat-pct font-bold"
                              style={{ color: color.text }}
                            >
                              ({pct}%)
                            </span>
                          </div>

                          {/* Pillar Track & Bar */}
                          <div
                            className="v-bar-pillar-wrap barchart-track"
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            <div
                              className="v-bar-pillar barchart-fill"
                              style={{
                                height: `${heightPct}%`,
                                background: color.gradient,
                                boxShadow: `0 4px 12px ${color.glow}`,
                              }}
                              title={`${item.label}: ${countLabel} Admitted (${pct}%)`}
                            >
                              {pct >= 25 && (
                                <span className="v-bar-inner-pct font-bold font-mono">
                                  {pct}%
                                </span>
                              )}
                            </div>
                          </div>

                          {/* X-axis Label below Baseline */}
                          <div className="v-bar-bottom-label">
                            <span className="v-label-title barchart-label">
                              {item.label}
                            </span>
                            <span className="v-label-sub">
                              {item.confirmed} Admitted
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Admission Classes Grid Cards */}
          <div className="classes-cards-section mt-10 mb-12">
            <div className="section-header-compact mb-6 flex-between">
              <div>
                <h3 className="font-bold text-lg" style={{ margin: 0 }}>
                  Admission Classes
                </h3>
                <p className="text-xs text-muted" style={{ margin: '2px 0 0' }}>
                  Configured sections for Session 2027
                </p>
              </div>
              <span className="badge badge-confirmed font-semibold">
                {classes.length} Classes Configured
              </span>
            </div>

            <div
              className="authority-classes-cards-grid"
              id="authority-classes-cards-grid"
            >
              {classes.map((c) => {
                const classFee =
                  c.fee ||
                  (c.grade === 'Class 9' || c.grade === 'Class 10'
                    ? 1800
                    : 1500);
                const classRev = (c.confirmedSeats || 0) * classFee;
                const shiftName = c.shift || 'Morning';
                const groupName = c.group || 'General';

                return (
                  <div key={c.id} className="class-summary-card">
                    <div className="class-card-top">
                      <div className="class-card-title-row">
                        <h4 className="class-card-title">{c.name}</h4>
                        <span className="class-fee-badge font-mono">
                          ৳{classFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="class-card-pills-row">
                        <span className="badge badge-shift">
                          {shiftName} Shift
                        </span>
                        <span className="badge badge-group">{groupName}</span>
                      </div>
                    </div>

                    {/* Class Stat Grid */}
                    <div className="class-stat-box">
                      <div className="class-stat-grid">
                        <div className="class-stat-cell">
                          <span className="class-stat-label">Total Seats</span>
                          <span className="class-stat-num">{c.totalSeats}</span>
                        </div>
                        <div className="class-stat-cell">
                          <span className="class-stat-label">Admitted</span>
                          <span className="class-stat-num text-teal">
                            {c.confirmedSeats}
                          </span>
                        </div>
                        <div className="class-stat-cell">
                          <span className="class-stat-label">Held</span>
                          <span className="class-stat-num text-amber">
                            {c.heldSeats}
                          </span>
                        </div>
                        <div className="class-stat-cell">
                          <span className="class-stat-label">Available</span>
                          <span className="class-stat-num text-emerald">
                            {c.availableSeats}
                          </span>
                        </div>
                      </div>
                      <div className="class-stat-revenue-row">
                        <span className="class-stat-revenue-label">
                          Estimated Revenue
                        </span>
                        <span className="class-stat-revenue-val text-emerald font-mono">
                          ৳{classRev.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="class-card-footer">
                      <Link
                        to={`/authority/classes/${c.id}`}
                        className="btn btn-outline btn-block btn-class-details"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthorityStatisticsPage;
