/**
 * HeroSection.jsx - Homepage Hero with Session Highlight and Live Dynamic LED Clock
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { storageService } from '../../services/storageService';
import { schoolConfig } from '../../config/schoolConfig';
import { admissionConfig } from '../../config/admissionConfig';
import { formatDhms } from '../../utils/formatters';
import { ArrowRightIcon, SchoolShieldIcon } from '../common/Icons';

export function HeroSection() {
  const [clockData, setClockData] = useState({
    title: 'Session 27 Admission Schedule',
    time: 'Calculating schedule...',
    hint: 'First-come, first-served seat allocation active',
  });

  useEffect(() => {
    const updateHeroClock = () => {
      const currentTimeline = storageService.getTimeline() || admissionConfig.defaultTimeline;
      if (!currentTimeline || !currentTimeline.startDate || !currentTimeline.endDate) {
        setClockData({
          title: 'Session 27 Admission Schedule',
          time: 'To be announced',
          hint: 'Official schedule to be announced by school administration',
        });
        return;
      }

      const startDate = new Date(currentTimeline.startDate).getTime();
      const endDate = new Date(currentTimeline.endDate).getTime();
      const now = Date.now();

      if (isNaN(startDate) || isNaN(endDate)) {
        setClockData({
          title: 'Session 27 Admission Schedule',
          time: 'To be announced',
          hint: 'Official schedule to be announced by school administration',
        });
        return;
      }

      if (now < startDate) {
        const diff = startDate - now;
        setClockData({
          title: 'Session 27 Admission Starts In:',
          time: formatDhms(diff),
          hint: 'Admissions opening soon for Class 6–10',
        });
      } else if (now >= startDate && now <= endDate) {
        const diff = endDate - now;
        setClockData({
          title: 'Session 27 Admission Closes In:',
          time: formatDhms(diff),
          hint: 'First-come, first-served allocation currently open',
        });
      } else {
        setClockData({
          title: 'Session 27 Admission Schedule',
          time: 'Admission Closed for Session 27',
          hint: 'Check back for next academic session announcements',
        });
      }
    };

    updateHeroClock();
    const interval = setInterval(updateHeroClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section" id="hero">
      <div className="container hero-container">
        {/* Left Column */}
        <div className="hero-content">
          <div className="portal-badge font-bold highlight-session">
            <span className="portal-dot"></span>
            <span>{admissionConfig.hero.badge}</span>
          </div>

          <h1 className="hero-title">{admissionConfig.hero.title}</h1>

          <p className="hero-description">{admissionConfig.hero.description}</p>

          {/* Bold & Highlighted Tagline */}
          <div className="hero-tagline-highlight">
            <strong>{admissionConfig.hero.taglineHighlight}</strong>
          </div>

          <div className="hero-actions">
            <Link to="/admissions/classes" className="btn btn-primary btn-lg">
              Explore Admission Classes <ArrowRightIcon />
            </Link>
            <Link to="/admission-info" className="btn btn-outline btn-lg" id="hero-btn-learn">
              Info
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Presentation & Dynamic Clock */}
        <div className="hero-visual" aria-hidden="true">
          {/* Live Admission Schedule Clock with Bright Styling */}
          <div className="hero-admission-timer hero-timer-bright" id="hero-admission-timer">
            <div className="timer-label-row">
              <span className="timer-dot-pulse"></span>
              <span className="timer-heading" id="hero-timer-title">
                {clockData.title}
              </span>
            </div>
            <div className="timer-countdown-val font-mono" id="hero-admission-clock">
              {clockData.time}
            </div>
            <div className="timer-subtitle text-xs" id="hero-timer-hint">
              {clockData.hint}
            </div>
          </div>

          {/* Hero Preview Card Stack */}
          <div className="hero-card-stack">
            <div className="hero-preview-badge">
              <div className="badge-icon">
                <SchoolShieldIcon width={24} height={24} />
              </div>
              <div>
                <div className="font-semibold text-white">{schoolConfig.name}</div>
                <div className="text-xs text-blue-200">{admissionConfig.sessionName} Enrollment</div>
              </div>
            </div>

            <div className="hero-graphic-box">
              <div className="visual-header">
                <span className="visual-dot red"></span>
                <span className="visual-dot amber"></span>
                <span className="visual-dot green"></span>
                <span className="visual-title font-mono">seat_allocation.live</span>
              </div>
              <div className="visual-body">
                <div className="visual-row">
                  <span>Class 6 — Morning</span>
                  <span className="visual-tag green">Available</span>
                </div>
                <div className="visual-row">
                  <span>Class 8 — Day</span>
                  <span className="visual-tag green">Available</span>
                </div>
                <div className="visual-row">
                  <span>Class 9 — Science</span>
                  <span className="visual-tag amber">Limited</span>
                </div>
                <div className="visual-meter">
                  <div className="meter-bar" style={{ width: '82%' }}></div>
                </div>
                <div className="visual-caption">Live Seat Allocation System</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
