'use client';

import { useState } from 'react';
import { sendSMSNotification } from '@/app/actions/send-sms';

export default function TestSMSPage() {
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSendTest = async () => {
        setLoading(true);
        setStatus('Sending...');
        try {
            const result = await sendSMSNotification(
                'Test Video Title',
                'https://example.com/test-video'
            );
            if (result.success) {
                setStatus(`Success! Message ID: ${result.messageId}`);
            } else {
                setStatus(`Error: ${result.error}`);
            }
        } catch (error: any) {
            setStatus(`Critical Error: ${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
            <h1 style={{ marginBottom: '1rem' }}>SMS Notification Test</h1>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
                Click the button below to send a test SMS notification using the configured Twilio credentials.
            </p>
            
            <button 
                onClick={handleSendTest} 
                disabled={loading}
                style={{
                    backgroundColor: '#0070f3',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'transform 0.1s'
                }}
            >
                {loading ? 'Sending...' : 'Send Test SMS'}
            </button>

            {status && (
                <div style={{ 
                    marginTop: '2rem', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    backgroundColor: status.startsWith('Success') ? '#e7f9ed' : '#f9e7e7',
                    border: `1px solid ${status.startsWith('Success') ? '#25D366' : '#d32f2f'}`,
                    color: status.startsWith('Success') ? '#1e7e34' : '#d32f2f'
                }}>
                    <strong>Status:</strong> {status}
                </div>
            )}

            <div style={{ marginTop: '3rem', fontSize: '0.875rem', color: '#888' }}>
                <p>Note: Ensure your <code>.env.local</code> has correct Twilio credentials:</p>
                <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                    <li>TWILIO_ACCOUNT_SID</li>
                    <li>TWILIO_AUTH_TOKEN</li>
                    <li>TWILIO_SMS_FROM (Your Twilio Phone Number)</li>
                    <li>WHATSAPP_RECIPIENT_NUMBER (Reused for SMS)</li>
                </ul>
            </div>
        </div>
    );
}
