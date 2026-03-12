'use client';

import { useState, useTransition } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import styles from './contact.module.css';
import { submitEnquiry } from '@/app/actions';

interface ContactFormProps {
  dict: any;
}

export default function ContactForm({ dict }: ContactFormProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await submitEnquiry(formData);
      // Use localized messages from dictionary
      const feedbackMessage = result.success ? dict.contactPage.form.success : (result.message || dict.contactPage.form.error);
      setFeedback({ success: result.success, message: feedbackMessage });
      if (result.success) {
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <div className={styles.formCard}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{dict.contactPage.form.studentName}</label>
            <input 
              type="text" 
              name="studentName"
              placeholder={dict.contactPage.form.studentName} 
              className={styles.input} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{dict.contactPage.form.yearLevel}</label>
            <input 
              type="text" 
              name="yearLevel"
              placeholder={dict.contactPage.form.yearLevel} 
              className={styles.input} 
            />
          </div>
        </div>
        
        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{dict.contactPage.form.email}</label>
            <input 
              type="email" 
              name="email"
              placeholder={dict.contactPage.form.email} 
              className={styles.input} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>{dict.contactPage.form.phone}</label>
            <input 
              type="tel" 
              name="phone"
              placeholder={dict.contactPage.form.phone} 
              className={styles.input} 
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>{dict.contactPage.form.subject}</label>
          <select name="subject" className={styles.input} defaultValue="">
            <option value="" disabled>{dict.contactPage.form.subject}</option>
            <option value="maths">{dict.contactPage.form.maths}</option>
            <option value="english">{dict.contactPage.form.english}</option>
            <option value="science">{dict.contactPage.form.science}</option>
            <option value="other">{dict.contactPage.form.other}</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>{dict.contactPage.form.message}</label>
          <textarea 
            name="message"
            placeholder={dict.contactPage.form.message} 
            rows={5} 
            className={styles.input} 
            required
          ></textarea>
        </div>

        {feedback && (
          <div className={`${styles.feedback} ${feedback.success ? styles.success : styles.error}`}>
            {feedback.success ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} />
                <span>{feedback.message}</span>
              </div>
            ) : (
              feedback.message
            )}
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 size={20} className="spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>{dict.contactPage.form.submit}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
