import { Mail, Phone, MapPin } from 'lucide-react';
import styles from './contact.module.css';
import { getDictionary } from '../../../get-dictionary';

export default async function Contact({ params }: { params: Promise<{ lang: 'en' | 'zh' }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            <div>
              <h2 style={{ marginBottom: '20px' }}>{dict.contactPage.title}</h2>
              <p className="text-light" style={{ marginBottom: '40px' }}>
                {dict.contactPage.desc}
              </p>
              
              <div className={styles.contactInfo}>
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}><Phone size={20} /></div>
                  <div>
                    <h4>{dict.contactPage.phone}</h4>
                    <p>0400 000 000</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}><Mail size={20} /></div>
                  <div>
                    <h4>{dict.contactPage.email}</h4>
                    <p>info@ibheros.com.au</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}><MapPin size={20} /></div>
                  <div>
                    <h4>{dict.contactPage.location}</h4>
                    <p>Melbourne, Victoria</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.formCard}>
              <h3 style={{ marginBottom: '25px' }}>{dict.contactPage.form.title}</h3>
              <form className={styles.form}>
                <div className={styles.row}>
                  <input type="text" placeholder={dict.contactPage.form.studentName} className={styles.input} />
                  <input type="text" placeholder={dict.contactPage.form.yearLevel} className={styles.input} />
                </div>
                <input type="email" placeholder={dict.contactPage.form.email} className={styles.input} />
                <input type="tel" placeholder={dict.contactPage.form.phone} className={styles.input} />
                <select className={styles.input} style={{ appearance: 'none' }}>
                  <option value="">{dict.contactPage.form.subject}</option>
                  <option value="maths">{dict.contactPage.form.maths}</option>
                  <option value="english">{dict.contactPage.form.english}</option>
                  <option value="science">{dict.contactPage.form.science}</option>
                  <option value="other">{dict.contactPage.form.other}</option>
                </select>
                <textarea placeholder={dict.contactPage.form.message} rows={4} className={styles.input}></textarea>
                <button type="button" className="btn btn-primary">{dict.contactPage.form.submit}</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
