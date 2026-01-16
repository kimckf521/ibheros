import styles from './Footer.module.css';
import Link from 'next/link';

const Footer = ({ dict, lang }: { dict: any, lang: string }) => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <h3>IB Heros</h3>
            <p>{dict.hero.subtitle}</p>
          </div>
          
          <div className={styles.links}>
            <h4>{dict.footer.company}</h4>
            <ul>
              <li><Link href={`/${lang}/about`}>{dict.footer.about}</Link></li>
              <li><Link href={`/${lang}/join-team`}>{dict.footer.careers}</Link></li>
              <li><Link href={`/${lang}/contact`}>{dict.footer.contact}</Link></li>
            </ul>
          </div>
          
          <div className={styles.links}>
            <h4>{dict.footer.services}</h4>
            <ul>
              <li><Link href={`/${lang}/services`}>VCE Tutoring</Link></li>
              <li><Link href={`/${lang}/services`}>HSC Tutoring</Link></li>
              <li><Link href={`/${lang}/services`}>IB Tutoring</Link></li>
            </ul>
          </div>

          <div className={styles.links}>
            <h4>{dict.footer.legal}</h4>
            <ul>
              <li><Link href={`/${lang}/legal/privacy-policy`}>{dict.footer.privacy}</Link></li>
              <li><Link href={`/${lang}/legal/terms`}>{dict.footer.terms}</Link></li>
              <li><Link href={`/${lang}/legal/disclaimer`}>{dict.footer.disclaimer}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.copyright}>
          <p>© {new Date().getFullYear()} IB Heros Clone. {dict.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
