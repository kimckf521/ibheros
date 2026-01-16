'use client';

import styles from './Services.module.css';
import { Check } from 'lucide-react';

export default function ButlerService({ dict }: { dict: any }) {
  const content = dict.servicesPage.butler;
  const tiers = content.tiers;

  return (
    <div>
      <div className={styles.heading}>
        <h2 className={styles.title}>{content.title}</h2>
        <p className={styles.subtitle}>{content.description}</p>
      </div>

      <div className={styles.butlerGrid}>
        {/* Basic Tier */}
        <div className={styles.tierCard}>
          <div className={styles.tierHeader}>
            <h3 className={styles.tierName}>{tiers.basic.name}</h3>
            <p className={styles.tierPrice}>{tiers.basic.price}</p>
          </div>
          <div className={styles.tierFeatures}>
            <ul className={styles.featureList}>
              {tiers.basic.features.map((feature: string, i: number) => (
                <li key={i} className={styles.featureItem}>
                  <Check className={styles.checkIcon} size={18} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Standard Tier */}
        <div className={`${styles.tierCard} ${styles.standard}`}>
            <div className={styles.tierHeader}>
            <h3 className={styles.tierName}>{tiers.standard.name}</h3>
            <p className={styles.tierPrice}>{tiers.standard.price}</p>
          </div>
          <div className={styles.tierFeatures}>
            <ul className={styles.featureList}>
              {tiers.standard.features.map((feature: string, i: number) => (
                <li key={i} className={styles.featureItem}>
                  <Check className={styles.checkIcon} size={18} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* VIP Tier */}
        <div className={`${styles.tierCard} ${styles.vip}`}>
             <div className={styles.tierHeader}>
            <h3 className={styles.tierName}>{tiers.vip.name}</h3>
            <p className={styles.tierPrice}>{tiers.vip.price}</p>
          </div>
          <div className={styles.tierFeatures}>
            <ul className={styles.featureList}>
              {tiers.vip.features.map((feature: string, i: number) => (
                <li key={i} className={styles.featureItem}>
                  {/* White check for vip if bg is dark */}
                   <Check className={styles.checkIcon} size={18} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
