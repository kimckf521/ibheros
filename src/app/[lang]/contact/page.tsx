import styles from './contact.module.css';
import { getDictionary } from '../../../get-dictionary';
import ContactForm from './ContactForm';

export default async function Contact({ params }: { params: Promise<{ lang: 'en' | 'zh' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>{dict.contactPage.title}</h1>
          <p className={styles.desc}>{dict.contactPage.desc}</p>
        </div>
        
        <ContactForm dict={dict} />
      </div>
    </main>
  );
}
