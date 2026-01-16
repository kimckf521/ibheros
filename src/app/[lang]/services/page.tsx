import { getDictionary } from '../../../get-dictionary';
import ServicesSection from '@/components/services/ServicesSection';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function ServicesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const validLang = (lang === 'en' || lang === 'zh') ? lang : 'en';
  const dict = await getDictionary(validLang);

  return (
    <main>
      <div style={{ paddingTop: '80px' }}>
         <ServicesSection dict={dict} />
      </div>
    </main>
  );
}
