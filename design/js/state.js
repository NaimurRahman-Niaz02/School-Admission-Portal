/**
 * state.js - Centralized Reactive Application State
 * Hashmat Uddin High School Admission Portal
 */

(function (window) {
  'use strict';

  const AppState = {
    studentId: null,
    rememberStudent: true,
    admissionState: 'NONE', // 'NONE' | 'HELD' | 'CONFIRMED'
    currentApplication: null,
    canApply: true,
    restrictionReason: null,
    isInitialized: false,
    _listeners: new Set(),

    /**
     * Subscribe to state changes
     */
    subscribe(listener) {
      if (typeof listener === 'function') {
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
      }
      return () => {};
    },

    /**
     * Notify all subscribers
     */
    notify() {
      const stateSnapshot = this.getSnapshot();
      for (const listener of this._listeners) {
        try {
          listener(stateSnapshot);
        } catch (err) {
          console.error('State subscriber notification error:', err);
        }
      }
    },

    /**
     * Return immutable copy of current state
     */
    getSnapshot() {
      return {
        studentId: this.studentId,
        rememberStudent: this.rememberStudent,
        admissionState: this.admissionState,
        currentApplication: this.currentApplication ? { ...this.currentApplication } : null,
        canApply: this.canApply,
        restrictionReason: this.restrictionReason,
        isInitialized: this.isInitialized
      };
    },

    /**
     * Initialize state from storage
     */
    async init() {
      this.studentId = Store.getSavedStudentId() || null;
      this.rememberStudent = Store.isRememberStudent();
      await this.refreshAdmissionState();
      this.isInitialized = true;
      this.notify();
    },

    /**
     * Set active student ID and reload their admission state
     */
    async setStudentId(newId, remember = true) {
      const cleanId = (newId || '').trim();
      if (!Utils.isValid17DigitId(cleanId)) {
        throw new Error('A 17-digit birth registration number is required.');
      }

      this.studentId = cleanId;
      this.rememberStudent = remember;
      Store.saveStudentId(cleanId, remember);

      await this.refreshAdmissionState();
      this.notify();
    },

    /**
     * Clear student ID
     */
    clearStudentId() {
      this.studentId = null;
      Store.clearStudentId();
      this.admissionState = 'NONE';
      this.currentApplication = null;
      this.canApply = true;
      this.restrictionReason = null;
      this.notify();
    },

    /**
     * Synchronize student admission state with MockApi
     */
    async refreshAdmissionState() {
      if (!this.studentId) {
        this.admissionState = 'NONE';
        this.currentApplication = null;
        this.canApply = true;
        this.restrictionReason = null;
        return;
      }

      try {
        const summary = await MockApi.getStudentAdmissionSummary(this.studentId);
        this.admissionState = summary.admissionState;
        this.currentApplication = summary.currentApplication;
        this.canApply = summary.canApply;
        this.restrictionReason = summary.reason;
      } catch (err) {
        console.error('Error refreshing admission state:', err);
      }
    }
  };

  window.AppState = AppState;
})(window);

