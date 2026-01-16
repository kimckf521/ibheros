'use client';

import styles from './Services.module.css';

export default function VisaService({ dict }: { dict: any }) {
  const content = dict.servicesPage.visa;

  return (
    <div>
      <div className={styles.heading}>
        <h2 className={styles.title}>{content.title}</h2>
        <p className={styles.subtitle}>{content.description}</p>
      </div>

      <div className={styles.visaGrid}>
        {content.services.map((item: any, index: number) => (
          <div key={index} className={styles.visaCard}>
            <div className="flex flex-col h-full">
              <h3 className={styles.visaTitle}>{item.title}</h3>
              <p className={styles.visaDesc} style={{ flex: 1, marginBottom: '1.5rem' }}>{item.description}</p>
              
              <div className="mt-auto pt-4 border-t border-[var(--border-color)]">
                <a href="/en/contact" className="flex items-center justify-between text-[var(--primary-color)] font-semibold hover:opacity-80 transition-opacity">
                  {content.cta}
                  <span className="text-lg">→</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
