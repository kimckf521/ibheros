'use client';

import styles from './Services.module.css';
import { BookOpen, Calculator, GraduationCap, Microscope } from 'lucide-react';

export default function AcademicService({ dict }: { dict: any }) {
  const content = dict.servicesPage.academic;
  
  return (
    <div className={styles.academicSection}>
      <div className={styles.heading}>
        <h2 className={styles.title}>{content.title}</h2>
        <p className={styles.subtitle}>{content.description}</p>
      </div>

      <div className={styles.academicGrid}>
        {/* Reuse the maths/english/science content but in this new context */}
        <div className={styles.card}>
          <div className="mb-4 text-[var(--accent-color)]">
            <Calculator size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">{dict.services.maths.title}</h3>
          <p className="text-[var(--text-body)]">{dict.services.maths.desc}</p>
        </div>

        <div className={styles.card}>
           <div className="mb-4 text-[var(--accent-color)]">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">{dict.services.english.title}</h3>
          <p className="text-[var(--text-body)]">{dict.services.english.desc}</p>
        </div>

        <div className={styles.card}>
           <div className="mb-4 text-[var(--accent-color)]">
            <Microscope size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">{dict.services.science.title}</h3>
          <p className="text-[var(--text-body)]">{dict.services.science.desc}</p>
        </div>

        <div className={styles.card}>
           <div className="mb-4 text-[var(--accent-color)]">
            <GraduationCap size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">{dict.services.specialist.title}</h3>
          <p className="text-[var(--text-body)]">{dict.services.specialist.desc}</p>
        </div>
      </div>
    </div>
  );
}
