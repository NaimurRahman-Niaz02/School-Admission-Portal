/**
 * HomePage.jsx - Public Student Portal Landing and Welcome Hub
 * Hashmat Uddin High School Online Admission System
 */

import { useEffect } from 'react';
import { HeroSection } from '../../components/home/HeroSection';
import { AdmissionOverview } from '../../components/home/AdmissionOverview';
import { AcademicClassesBanner } from '../../components/home/AcademicClassesBanner';
import { AdmissionJourney } from '../../components/home/AdmissionJourney';
import { AdmissionGuidelines } from '../../components/home/AdmissionGuidelines';
import { ExistingApplicantCta } from '../../components/home/ExistingApplicantCta';

export function HomePage() {
  useEffect(() => {
    document.title = 'Hashmat Uddin High School | Admission Portal';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <>
      <HeroSection />
      <AdmissionOverview />
      <AcademicClassesBanner />
      <AdmissionJourney />
      <AdmissionGuidelines />
      <ExistingApplicantCta />
    </>
  );
}

export default HomePage;

