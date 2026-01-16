'use client';

import { useState } from 'react';
import styles from './Services.module.css';
import AcademicService from './AcademicService';
import ButlerService from './ButlerService';
import VisaService from './VisaService';

export default function ServicesSection({ dict }: { dict: any }) {
  const [activeTab, setActiveTab] = useState<'academic' | 'butler' | 'visa'>('academic');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <h1 className={styles.title}>{dict.servicesPage.title}</h1>
          <p className={styles.subtitle}>{dict.servicesPage.subtitle}</p>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'academic' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('academic')}
          >
            {dict.servicesPage.tabs.academic}
          </button>
          <button 
             className={`${styles.tabBtn} ${activeTab === 'butler' ? styles.tabBtnActive : ''}`}
             onClick={() => setActiveTab('butler')}
          >
            {dict.servicesPage.tabs.butler}
          </button>
          <button 
             className={`${styles.tabBtn} ${activeTab === 'visa' ? styles.tabBtnActive : ''}`}
             onClick={() => setActiveTab('visa')}
          >
            {dict.servicesPage.tabs.visa}
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'academic' && <AcademicService dict={dict} />}
          {activeTab === 'butler' && <ButlerService dict={dict} />}
          {activeTab === 'visa' && <VisaService dict={dict} />}
        </div>

      </div>
    </section>
  );
}
