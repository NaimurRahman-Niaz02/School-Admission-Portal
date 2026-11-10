/**
 * AuthorityCreateClassPage.jsx - Class Provisioning and Duplicate Prevention
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiService } from '../../services/apiService';
import { useToast } from '../../context/useToast';
import { CheckCircleIcon } from '../../components/common/Icons';

export function AuthorityCreateClassPage() {
  const { showToast } = useToast();

  const [year] = useState('2027');
  const [grade, setGrade] = useState('Class 6');
  const [shift, setShift] = useState('Morning');
  const [group, setGroup] = useState('General');
  const [seats, setSeats] = useState(40);
  const [fee, setFee] = useState(1500);

  // Errors & States
  const [seatsError, setSeatsError] = useState('');
  const [feeError, setFeeError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdClass, setCreatedClass] = useState(null);

  useEffect(() => {
    document.title = 'Create Admission Class — Authority Portal | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const isHigherGrade = grade === 'Class 9' || grade === 'Class 10';

  // Handle grade change and update group & fee
  const handleGradeChange = (newGrade) => {
    setGrade(newGrade);
    const higher = newGrade === 'Class 9' || newGrade === 'Class 10';
    if (higher) {
      setGroup('Science');
      setFee(1800);
    } else {
      setGroup('General');
      setFee(1500);
    }
  };

  const handleGroupChange = (newGroup) => {
    setGroup(newGroup);
    if (newGroup === 'Science') {
      setFee(1800);
    } else if (newGroup === 'Commerce' || newGroup === 'Arts') {
      setFee(1700);
    } else {
      setFee(1500);
    }
  };

  // Live duplicate check effect
  useEffect(() => {
    let isMounted = true;

    const checkDuplicate = async () => {
      try {
        const dup = await apiService.findDuplicateClass(
          grade,
          shift,
          group,
          year
        );
        if (isMounted) {
          if (dup) {
            setDuplicateWarning(
              `This class already exists: "${dup.name}" is already created for Year ${year}. You cannot create duplicate classes.`
            );
          } else {
            setDuplicateWarning('');
          }
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      }
    };

    checkDuplicate();

    return () => {
      isMounted = false;
    };
  }, [grade, shift, group, year]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSeatsError('');
    setFeeError('');
    setGeneralError('');

    const seatNum = parseInt(seats, 10);
    const feeNum = parseInt(fee, 10);

    if (isNaN(seatNum) || seatNum <= 0) {
      setSeatsError('Please enter a valid seat count.');
      return;
    }

    if (seatNum > 500) {
      setSeatsError('Total seats cannot exceed 500 per class.');
      return;
    }

    if (isNaN(feeNum) || feeNum <= 0) {
      setFeeError('Please enter a valid admission fee.');
      return;
    }

    if (duplicateWarning) {
      setGeneralError(duplicateWarning);
      showToast('This class already exists for Year 2027.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const timeline = await apiService.getAdmissionTimeline();
      const newClass = await apiService.createClass({
        grade,
        shift,
        group,
        session: 'Session 27',
        totalSeats: seatNum,
        fee: feeNum,
        admissionStartDate: timeline?.startDate,
        admissionEndDate: timeline?.endDate,
      });

      setCreatedClass(newClass);
      showToast(`Class "${newClass.name}" created successfully!`, 'success');
    } catch (err) {
      setGeneralError(err.message || 'Failed to create class.');
      showToast(err.message, 'error', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setCreatedClass(null);
    setGrade('Class 6');
    setShift('Morning');
    setGroup('General');
    setSeats(40);
    setFee(1500);
    setGeneralError('');
    setSeatsError('');
    setFeeError('');
  };

  return (
    <div className="authority-portal-wrapper">
      <div className="container authority-body">
        {/* Page Title */}
        <div className="create-class-page-header">
          <h1 className="authority-title">Create Admission Class</h1>
        </div>

        {/* Form Container */}
        <div className="create-class-centered-container">
          <div className="authority-card create-class-card" id="create-class-card">
            {!createdClass ? (
              <form
                id="dedicated-create-class-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="create-class-form-grid">
                  {/* Row 1: Academic Year & Class */}
                  <div className="form-group">
                    <label htmlFor="create-page-year" className="form-label">
                      Academic Year <span className="text-danger">*</span>
                    </label>
                    <select
                      id="create-page-year"
                      className="form-control form-select"
                      value={year}
                      disabled
                    >
                      <option value="2027">2027</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="create-page-class" className="form-label">
                      Class <span className="text-danger">*</span>
                    </label>
                    <select
                      id="create-page-class"
                      className="form-control form-select"
                      value={grade}
                      onChange={(e) => handleGradeChange(e.target.value)}
                    >
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                    </select>
                  </div>

                  {/* Row 2: Shift & Group */}
                  <div className="form-group">
                    <label htmlFor="create-page-shift" className="form-label">
                      Shift <span className="text-danger">*</span>
                    </label>
                    <select
                      id="create-page-shift"
                      className="form-control form-select"
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                    >
                      <option value="Morning">Morning</option>
                      <option value="Day">Day</option>
                    </select>
                  </div>

                  <div className="form-group" id="create-page-group-box">
                    <label htmlFor="create-page-group" className="form-label">
                      Group <span className="text-danger">*</span>
                    </label>
                    <select
                      id="create-page-group"
                      className="form-control form-select"
                      disabled={!isHigherGrade}
                      value={group}
                      onChange={(e) => handleGroupChange(e.target.value)}
                    >
                      {isHigherGrade ? (
                        <>
                          <option value="Science">Science</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Arts">Arts</option>
                        </>
                      ) : (
                        <option value="General">General</option>
                      )}
                    </select>
                  </div>

                  {/* Row 3: Total Seats & Admission Fee */}
                  <div className="form-group">
                    <label htmlFor="create-page-seats" className="form-label">
                      Total Seats <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="create-page-seats"
                      className="form-control"
                      placeholder="e.g. 40"
                      min="1"
                      max="500"
                      value={seats}
                      onChange={(e) => {
                        setSeats(e.target.value);
                        setSeatsError('');
                      }}
                      required
                    />
                    {seatsError && (
                      <div
                        id="create-page-seats-error"
                        className="form-error-msg"
                        style={{
                          display: 'block',
                          color: '#ef4444',
                          fontSize: '0.8125rem',
                          marginTop: '4px',
                        }}
                      >
                        {seatsError}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="create-page-fee" className="form-label">
                      Admission Fee (৳ BDT) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="create-page-fee"
                      className="form-control"
                      placeholder="e.g. 1500"
                      min="100"
                      max="50000"
                      value={fee}
                      onChange={(e) => {
                        setFee(e.target.value);
                        setFeeError('');
                      }}
                      required
                    />
                    {feeError && (
                      <div
                        id="create-page-fee-error"
                        className="form-error-msg"
                        style={{
                          display: 'block',
                          color: '#ef4444',
                          fontSize: '0.8125rem',
                          marginTop: '4px',
                        }}
                      >
                        {feeError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Duplicate or General Error Banner */}
                {(duplicateWarning || generalError) && (
                  <div
                    id="create-page-general-error"
                    className="alert alert-danger mt-4 mb-2"
                    style={{ display: 'block' }}
                  >
                    {duplicateWarning || generalError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  id="btn-create-page-submit"
                  className="btn btn-primary btn-block btn-lg btn-create-submit"
                  disabled={isSubmitting || Boolean(duplicateWarning)}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-sm"></span> Creating...
                    </>
                  ) : (
                    'Create Class'
                  )}
                </button>
              </form>
            ) : (
              /* Post-Creation Success View */
              <div
                id="create-class-success-view"
                className="p-6 text-center"
                style={{ display: 'block' }}
              >
                <div className="mb-5">
                  <div className="success-icon-badge mb-3">
                    <CheckCircleIcon width={48} height={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-primary-900 mb-1">
                    Class Created Successfully!
                  </h2>
                  <p className="text-sm text-muted">
                    The new academic class is now registered and active in the system.
                  </p>
                </div>

                <div className="created-class-details-card mb-6 text-left">
                  <div className="details-row">
                    <span className="details-label">Class Name:</span>
                    <span
                      className="details-value font-bold text-primary"
                      id="success-class-name"
                    >
                      {createdClass.name}
                    </span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Academic Year:</span>
                    <span
                      className="details-value font-semibold"
                      id="success-class-year"
                    >
                      {year}
                    </span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Class:</span>
                    <span
                      className="details-value font-semibold"
                      id="success-class-grade"
                    >
                      {createdClass.grade}
                    </span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Shift:</span>
                    <span
                      className="details-value font-semibold"
                      id="success-class-shift"
                    >
                      {createdClass.shift}
                    </span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Group:</span>
                    <span
                      className="details-value font-semibold"
                      id="success-class-group"
                    >
                      {createdClass.group || 'General'}
                    </span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Total Seats:</span>
                    <span
                      className="details-value font-bold text-emerald"
                      id="success-class-seats"
                    >
                      {createdClass.totalSeats} Seats
                    </span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Admission Fee:</span>
                    <span
                      className="details-value font-bold font-mono text-primary"
                      id="success-class-fee"
                    >
                      ৳{(createdClass.fee || 1500).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="success-actions-col">
                  <Link
                    to="/authority/statistics"
                    className="btn btn-primary btn-block btn-lg"
                    id="btn-goto-stats"
                  >
                    Move to Statistics Page &rarr;
                  </Link>
                  <button
                    type="button"
                    className="btn btn-outline btn-block mt-3"
                    id="btn-create-another"
                    onClick={handleResetForAnother}
                  >
                    Create Another Class
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthorityCreateClassPage;
