import Hero from '@/components/Hero';
import StatsSection from '@/components/StatsSection';
import ServiceCard from '@/components/ServiceCard';
import { BookOpen, Calculator, GraduationCap } from 'lucide-react';
import styles from './page.module.css';
import { getDictionary } from '../../get-dictionary';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const validLang = (lang === 'en' || lang === 'zh') ? lang : 'en';
  const dict = await getDictionary(validLang);

  return (
    <main>
      <Hero dict={dict} lang={lang} />
      <StatsSection dict={dict} />
      
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '60px' }}>
            <h2 className="text-primary">{dict.services.title}</h2>
            <p className="text-light" style={{ maxWidth: '600px', margin: '0 auto' }}>
              {dict.services.description}
            </p>
          </div>
          
          <div className="grid-3">
            <ServiceCard 
              title={dict.services.specialist.title}
              description={dict.services.specialist.desc}
              icon={<GraduationCap size={24} />}
              link={`/${lang}/services`}
            />
            <ServiceCard 
              title={dict.services.maths.title}
              description={dict.services.maths.desc}
              icon={<Calculator size={24} />}
              link={`/${lang}/services`}
            />
            <ServiceCard 
              title={dict.services.english.title}
              description={dict.services.english.desc}
              icon={<BookOpen size={24} />}
              link={`/${lang}/services`}
            />
          </div>
          
          <div className="text-center" style={{ marginTop: '50px' }}>
            <a href={`/${lang}/services`} className="btn btn-primary">{dict.services.viewAll}</a>
          </div>
        </div>
      </section>

      <section className="section bg-light">
        <div className="container">
          <div className={styles.ctaBox}>
            <div>
              <h2>{dict.cta.title}</h2>
              <p>{dict.cta.text}</p>
            </div>
            <a href={`/${lang}/contact`} className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary-color)' }}>
              {dict.cta.button}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
