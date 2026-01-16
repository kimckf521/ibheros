import { CheckCircle } from 'lucide-react';
import { getDictionary } from '../../../get-dictionary';
import TutorApplicationForm from '@/components/TutorApplicationForm';

export default async function JoinTeam({ params }: { params: Promise<{ lang: 'en' | 'zh' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const benefits = [
    dict.joinTeamPage.benefits[0],
    dict.joinTeamPage.benefits[1],
    dict.joinTeamPage.benefits[2],
    dict.joinTeamPage.benefits[3],
    dict.joinTeamPage.benefits[4],
    dict.joinTeamPage.benefits[5]
  ];

  return (
    <main>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ marginBottom: '20px' }}>{dict.joinTeamPage.title}</h2>
            <p className="text-light" style={{ marginBottom: '30px' }}>
              {dict.joinTeamPage.desc}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {benefits.map((benefit: string, index: number) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={20} color="var(--success-color)" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <TutorApplicationForm dict={dict.joinTeamPage} />
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '1rem',
  fontFamily: 'inherit',
  outline: 'none',
};
