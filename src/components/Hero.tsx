import Link from 'next/link';
import styles from './Hero.module.css';

const Hero = ({ dict, lang }: { dict: any, lang: string }) => {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>
      <div className="container">
        <div className={styles.content}>
          <h1>
            {dict.hero.title1} <br />
            <span className="text-accent">{dict.hero.title2}</span>
          </h1>
          <p className={styles.subtitle}>
            {dict.hero.subtitle}
          </p>
          <div className={styles.actions}>
            <Link href={`/${lang}/contact`} className="btn btn-primary">
              {dict.header.bookSession}
            </Link>
            <Link href={`/${lang}/services`} className="btn btn-outline">
              {dict.hero.exploreServices}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
