import { getDictionary } from '../../../get-dictionary';
import ButlerService from '@/components/services/ButlerService';
import VisaService from '@/components/services/VisaService';

export default async function Pricing({ params }: { params: Promise<{ lang: 'en' | 'zh' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '60px' }}>
            <h1 className="text-primary">{dict.header.pricing}</h1>
            <p className="text-[var(--text-body)]" style={{ marginTop: '1rem', fontSize: '1.2rem' }}>{dict.servicesPage.tabs.academic}</p>
          </div>
          
          <div className="grid-3">
            {/* Basic Plan */}
            <div style={{ padding: '40px', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'center' }}>
              <h3>{dict.pricing.group.title}</h3>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary-color)', margin: '20px 0' }}>{dict.pricing.group.price}<span style={{ fontSize: '1rem', color: 'var(--text-light)' }}>{dict.pricing.group.unit}</span></div>
              <p>{dict.pricing.group.desc}</p>
              <ul style={{ textAlign: 'left', margin: '30px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 {dict.pricing.group.features.map((feature: string, i: number) => (
                   <li key={i}>✓ {feature}</li>
                 ))}
              </ul>
              <a href={`/${lang}/contact`} className="btn btn-outline" style={{ color: 'var(--primary-color)', borderColor: 'var(--border-color)', width: '100%' }}>{dict.pricing.group.button}</a>
            </div>

            {/* Popular Plan */}
            <div style={{ padding: '40px', border: '2px solid var(--accent-color)', borderRadius: '16px', textAlign: 'center', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-color)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>{dict.pricing.private.popular}</div>
              <h3>{dict.pricing.private.title}</h3>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary-color)', margin: '20px 0' }}>{dict.pricing.private.price}<span style={{ fontSize: '1rem', color: 'var(--text-light)' }}>{dict.pricing.private.unit}</span></div>
              <p>{dict.pricing.private.desc}</p>
              <ul style={{ textAlign: 'left', margin: '30px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 {dict.pricing.private.features.map((feature: string, i: number) => (
                   <li key={i}>✓ {feature}</li>
                 ))}
              </ul>
              <a href={`/${lang}/contact`} className="btn btn-primary" style={{ width: '100%' }}>{dict.pricing.private.button}</a>
            </div>

            {/* Premium Plan */}
            <div style={{ padding: '40px', border: '1px solid var(--border-color)', borderRadius: '16px', textAlign: 'center' }}>
              <h3>{dict.pricing.term.title}</h3>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary-color)', margin: '20px 0' }}>{dict.pricing.term.price}<span style={{ fontSize: '1rem', color: 'var(--text-light)' }}>{dict.pricing.term.unit}</span></div>
              <p>{dict.pricing.term.desc}</p>
              <ul style={{ textAlign: 'left', margin: '30px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 {dict.pricing.term.features.map((feature: string, i: number) => (
                   <li key={i}>✓ {feature}</li>
                 ))}
              </ul>
              <a href={`/${lang}/contact`} className="btn btn-outline" style={{ color: 'var(--primary-color)', borderColor: 'var(--border-color)', width: '100%' }}>{dict.pricing.term.button}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-[var(--background-alt)]">
        <div className="container">
           <ButlerService dict={dict} />
        </div>
      </section>

      <section className="section">
         <div className="container">
            <VisaService dict={dict} />
         </div>
      </section>
    </main>
  );
}
