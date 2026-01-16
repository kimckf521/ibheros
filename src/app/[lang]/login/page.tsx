'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Using next/navigation for router
import styles from '../../../components/Login.module.css'; // Adjust path if needed
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        // Successful login
        router.push('/dashboard'); 
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Note: This will only work if ENVs are set
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to access your account</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              required
              className={styles.input}
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>Or continue with</span>
        </div>

        <div className={styles.socialButtons}>
          <button 
            type="button" 
            className={styles.socialBtn}
            onClick={() => handleSocialLogin('google')}
          >
            <svg className={styles.googleIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Google
          </button>
          
          <button 
            type="button" 
            className={styles.socialBtn}
            onClick={() => handleSocialLogin('wechat')}
          >
            <svg className={styles.wechatIcon} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.5,14c-4.1,0-7.5-2.9-7.5-6.5S4.4,1,8.5,1c4.1,0,7.5,2.9,7.5,6.5c0,0.6-0.1,1.2-0.3,1.8c2.1,0.9,3.5,2.7,3.5,4.7c0,3.1-3.2,5.7-7.2,5.7c-0.6,0-1.1-0.1-1.7-0.2c-1.2,0.6-2.6,1-4.1,0.9c0.3-0.5,0.6-1.1,0.6-1.7C3.3,17.4,1,15.9,1,14L8.5,14z M17,14c0.6,0,1,0.4,1,1s-0.4,1-1,1s-1-0.4-1-1S16.4,14,17,14z M6,5C5.4,5,5,5.4,5,6s0.4,1,1,1s1-0.4,1-1S6.6,5,6,5z M11,5c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S11.4,5,11,5z"/>
            </svg>
            WeChat
          </button>
        </div>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '4px' }}>
          <p><strong>Testing Account:</strong></p>
          <p>Email: user@example.com</p>
          <p>Password: password</p>
        </div>
      </div>
    </div>
  );
}
