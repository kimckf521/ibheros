import { getDictionary } from '../../../../get-dictionary';

export default async function PrivacyPolicy({ params }: { params: Promise<{ lang: 'en' | 'zh' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return (
    <main>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h3>1. Introduction</h3>
          <p>At IB Heros, we rely on the trust of our students and parents. We are committed to protecting your personal information and your right to privacy.</p>
          
          <h3>2. Information We Collect</h3>
          <p>We gather personal information such as names, contact details, and academic history to provide our tutoring services effectively.</p>
          
          <h3>3. How We Use Your Information</h3>
          <p>Your data is used to schedule sessions, process payments, and improve our educational offerings. We do not sell your data to third parties.</p>
          
          <h3>4. Contact Us</h3>
          <p>If you have questions about this policy, please contact us at privacy@ibheros.com.au.</p>
        </div>
      </section>
    </main>
  );
}
