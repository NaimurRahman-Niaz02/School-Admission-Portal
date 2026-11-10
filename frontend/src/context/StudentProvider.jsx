/**
 * StudentProvider.jsx - Student Identity & Admission Lifecycle State Provider Component
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect, useCallback } from 'react';
import { StudentContext } from './StudentContext';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { isValid17DigitId } from '../utils/formatters';

export function StudentProvider({ children }) {
  const [studentId, setStudentIdState] = useState(() => storageService.getSavedStudentId() || null);
  const [rememberStudent, setRememberStudent] = useState(() => storageService.isRememberStudent());
  const [admissionState, setAdmissionState] = useState('NONE'); // 'NONE' | 'HELD' | 'CONFIRMED'
  const [currentApplication, setCurrentApplication] = useState(null);
  const [canApply, setCanApply] = useState(true);
  const [restrictionReason, setRestrictionReason] = useState(null);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);

  const refreshAdmissionState = useCallback(async (targetId = null) => {
    const idToQuery = targetId !== null ? targetId : studentId;
    if (!idToQuery || !isValid17DigitId(idToQuery)) {
      setAdmissionState('NONE');
      setCurrentApplication(null);
      setCanApply(true);
      setRestrictionReason(null);
      return;
    }

    try {
      const summary = await apiService.getStudentAdmissionSummary(idToQuery);
      setAdmissionState(summary.admissionState);
      setCurrentApplication(summary.currentApplication);
      setCanApply(summary.canApply);
      setRestrictionReason(summary.reason);
    } catch (err) {
      console.error('Error refreshing admission state:', err);
    }
  }, [studentId]);

  useEffect(() => {
    let ignore = false;
    async function initStudentState() {
      if (!studentId || !isValid17DigitId(studentId)) return;
      try {
        const summary = await apiService.getStudentAdmissionSummary(studentId);
        if (!ignore) {
          setAdmissionState(summary.admissionState);
          setCurrentApplication(summary.currentApplication);
          setCanApply(summary.canApply);
          setRestrictionReason(summary.reason);
        }
      } catch (err) {
        console.error('Error initializing student admission state:', err);
      }
    }

    initStudentState();
    return () => {
      ignore = true;
    };
  }, [studentId]);

  const setStudentId = useCallback(async (newId, remember = true) => {
    const cleanId = (newId || '').trim();
    if (!isValid17DigitId(cleanId)) {
      throw new Error('A 17-digit birth registration number is required.');
    }

    setStudentIdState(cleanId);
    setRememberStudent(remember);
    storageService.saveStudentId(cleanId, remember);

    await refreshAdmissionState(cleanId);
  }, [refreshAdmissionState]);

  const clearStudentId = useCallback(() => {
    setStudentIdState(null);
    storageService.clearStudentId();
    setAdmissionState('NONE');
    setCurrentApplication(null);
    setCanApply(true);
    setRestrictionReason(null);
  }, []);

  const openIdentityModal = useCallback(() => {
    setIsIdentityModalOpen(true);
  }, []);

  const closeIdentityModal = useCallback(() => {
    setIsIdentityModalOpen(false);
  }, []);

  return (
    <StudentContext.Provider
      value={{
        studentId,
        rememberStudent,
        admissionState,
        currentApplication,
        canApply,
        restrictionReason,
        isIdentityModalOpen,
        openIdentityModal,
        closeIdentityModal,
        setStudentId,
        clearStudentId,
        refreshAdmissionState,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export default StudentProvider;

