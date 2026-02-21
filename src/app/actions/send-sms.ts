'use server';

import twilio from 'twilio';
import fs from 'fs';
import path from 'path';

function logToFile(message: string) {
    const logPath = path.join(process.cwd(), 'debug_sms.log');
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch (e) {
        console.error("Failed to write to log file", e);
    }
}

export async function sendSMSNotification(videoTitle: string, videoUrl: string) {
  const msg = "Attempting to send SMS notification...";
  console.log(msg);
  logToFile(msg);
  
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const to = process.env.WHATSAPP_RECIPIENT_NUMBER; // Reusing the same recipient var
    const from = process.env.TWILIO_SMS_FROM;

    if (!accountSid || !authToken || !to || !from) {
        const missing = [];
        if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
        if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
        if (!to) missing.push('WHATSAPP_RECIPIENT_NUMBER');
        if (!from) missing.push('TWILIO_SMS_FROM');
        
        const errorMsg = `Missing Twilio SMS Configuration: ${missing.join(', ')}`;
        console.error(errorMsg);
        logToFile(errorMsg);
        return { success: false, error: errorMsg };
    }

    // Initialize client
    const client = twilio(accountSid, authToken);

    // Format Date: HH:MM, dd-mm-yy
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const dateStr = `${time}, ${day}-${month}-${year}`;

    const infoMsg = `Sending SMS from ${from} to ${to}`;
    console.log(infoMsg);
    logToFile(infoMsg);

    const message = await client.messages.create({
      body: `🎥 *New Video Uploaded!*\n\nDate: ${dateStr}\n\nTitle: ${videoTitle}\n\nView here: ${videoUrl}\n\n(Sent from IB Heros)`,
      from: from,
      to: to,
    });

    const successMsg = `SMS sent successfully: ${message.sid}`;
    console.log(successMsg);
    logToFile(successMsg);
    return { success: true, messageId: message.sid };
  } catch (error: any) {
    const errorMsg = `CRITICAL Error sending SMS: ${error.message || error}`;
    console.error(errorMsg);
    logToFile(errorMsg);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
