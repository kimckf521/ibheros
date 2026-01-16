import styles from './StatsSection.module.css';
import { Users, BookOpen, Trophy, Star } from 'lucide-react';

const StatsSection = ({ dict }: { dict: any }) => {
  const stats = [
    { icon: <Users size={32} />, value: '500+', label: dict.stats.students },
    { icon: <BookOpen size={32} />, value: '50+', label: dict.stats.tutors },
    { icon: <Trophy size={32} />, value: '98%', label: dict.stats.results },
    { icon: <Star size={32} />, value: '4.9/5', label: dict.stats.rating },
  ];

  return (
    <section className={`section bg-light ${styles.statsSection}`}>
      <div className="container">
        <div className={styles.grid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.icon}>{stat.icon}</div>
              <div className={styles.value}>{stat.value}</div>
              <div className={styles.label}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
