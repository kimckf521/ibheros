'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import styles from './Header.module.css';
import LanguageSwitcher from './LanguageSwitcher';

const Header = ({ dict, lang }: { dict: any, lang: string }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const redirectedPathName = (locale: string) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.container}`}>
        <Link href={`/${lang}`} className={styles.logo}>
          IB Heros
        </Link>
        
        {/* Desktop Nav */}
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li><Link href={`/${lang}`}>{dict.header.home}</Link></li>
            <li><Link href={`/${lang}/services`}>{dict.header.services}</Link></li>
            <li><Link href={`/${lang}/pricing`}>{dict.header.pricing}</Link></li>
            <li><Link href={`/${lang}/join-team`}>{dict.header.becomeTutor}</Link></li>
          </ul>
        </nav>
        
        <div className={styles.actions}>
           <div className="hidden-mobile">
              <Link href={`/${lang}/contact`} className="btn btn-primary">
                {dict.header.bookSession}
              </Link>
           </div>
          <LanguageSwitcher />
        </div>

        {/* Mobile Toggle Button & Lang Switcher Wrapper */}
        <div className={styles.mobileControls}>
           {/* Mobile Language Button */}
           <Link 
             href={redirectedPathName(lang === 'en' ? 'zh' : 'en')} 
             className={styles.mobileLangBtn}
           >
             {lang === 'en' ? '中' : 'EN'}
           </Link>

           <button 
            className={styles.mobileToggle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            <ul className={styles.mobileNavList}>
              <li><Link href={`/${lang}`} onClick={() => setIsMenuOpen(false)}>{dict.header.home}</Link></li>
              <li><Link href={`/${lang}/services`} onClick={() => setIsMenuOpen(false)}>{dict.header.services}</Link></li>
              <li><Link href={`/${lang}/pricing`} onClick={() => setIsMenuOpen(false)}>{dict.header.pricing}</Link></li>
              <li><Link href={`/${lang}/join-team`} onClick={() => setIsMenuOpen(false)}>{dict.header.becomeTutor}</Link></li>
              <li><Link href={`/${lang}/contact`} onClick={() => setIsMenuOpen(false)} className="btn btn-primary" style={{ display: 'inline-block', width: 'auto', marginTop: '1rem' }}>{dict.header.bookSession}</Link></li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
