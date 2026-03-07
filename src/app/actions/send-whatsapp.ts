'use server';

import twilio from 'twilio';
import fs from 'fs';
import path from 'path';

function logToFile(message: string) {
    const logPath = path.join(process.cwd(), 'debug_whatsapp.log');
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch (e) {
        console.error("Failed to write to log file", e);
    }
}

export async function sendWhatsAppNotification(videoTitle: string, videoUrl: string) {
  const msg = "Attempting to send WhatsApp notification...";
  console.log(msg);
  logToFile(msg);
  
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const to = process.env.WHATSAPP_RECIPIENT_NUMBER;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken || !to || !from) {
        const missing = [];
        if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
        if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
        if (!to) missing.push('WHATSAPP_RECIPIENT_NUMBER');
        if (!from) missing.push('TWILIO_WHATSAPP_FROM');
        
        const errorMsg = `Missing Twilio WhatsApp Configuration: ${missing.join(', ')}`;
        console.error(errorMsg);
        logToFile(errorMsg);
        return { success: false, error: errorMsg };
    }

    const client = twilio(accountSid, authToken);

    const fromNumber = `whatsapp:${from}`;
    const toNumber = `whatsapp:${to}`;
    const contentSid = 'HX1a9a5c3a7342ccd1993638efc7a20c4c';

    const infoMsg = `Sending WhatsApp from ${fromNumber} to ${toNumber} using template ${contentSid}`;
    console.log(infoMsg);
    logToFile(infoMsg);

    // Using Content Template
    const message = await client.messages.create({
      from: fromNumber,
      to: toNumber,
      contentSid: contentSid,
      contentVariables: JSON.stringify({
        "1": videoTitle,
        "2": videoUrl
      })
    });

    const successMsg = `WhatsApp message sent successfully: ${message.sid}`;
    console.log(successMsg);
    logToFile(successMsg);
    return { success: true, messageId: message.sid };
  } catch (error: any) {
    const errorMsg = `CRITICAL Error sending WhatsApp message: ${error.message || error}`;
    console.error(errorMsg);
    logToFile(errorMsg);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
