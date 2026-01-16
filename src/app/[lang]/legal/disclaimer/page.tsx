import { getDictionary } from '../../../../get-dictionary';

export default async function Disclaimer({ params }: { params: Promise<{ lang: 'en' | 'zh' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h3>Educational Results</h3>
          <p>While IB Heros strives to help every student achieve their best, we cannot guarantee specific academic results or grades. Success depends on individual effort and external factors.</p>
          
          <h3>Website Content</h3>
          <p>The information provided on this website is for general informational purposes only. We make no representations or warranties of any kind about the accuracy or completeness of the information.</p>
        </div>
      </section>
    </main>
  );
}
