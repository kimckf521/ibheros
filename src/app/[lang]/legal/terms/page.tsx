import { getDictionary } from '../../../../get-dictionary';

export default async function Terms({ params }: { params: Promise<{ lang: 'en' | 'zh' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h3>1. Service Agreement</h3>
          <p>By booking a session with IB Heros, you agree to these terms. Tutoring sessions are provided as described on our website.</p>
          
          <h3>2. Cancellations</h3>
          <p>We require at least 24 hours notice for cancellations. Sessions cancelled within this window may incur a fee.</p>
          
          <h3>3. Payment</h3>
          <p>Fees are payable in advance or as agreed upon in your package. We reserve the right to suspend services for outstanding payments.</p>
          
          <h3>4. Code of Conduct</h3>
          <p>Students and tutors are expected to treat each other with respect. Harassment of any kind will not be tolerated.</p>
        </div>
      </section>
    </main>
  );
}
