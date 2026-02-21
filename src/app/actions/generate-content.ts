'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || ""; // Fallback as requested
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateSocialContent(input: { type: 'base64' | 'url', data: string, mimeType?: string }) {
  try {
    // Use gemini-3-flash-preview model
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
Role: You are an expert social media manager for a Math Education channel.
Task: Based on the video content provided, generate two distinct outputs: one for Xiaohongshu (Chinese) and one for TikTok (English).

*** CRITICAL INSTRUCTION ***
You MUST output PURE JSON. Do not output markdown code blocks (no \`\`\`json). Just the raw JSON string.
The JSON structure must be exactly:
{
  "xhs": {
    "title": "...",
    "content": "...",
    "hashtags": "..." 
  },
  "tiktok": {
    "description": "...",
    "hashtags": "..."
  }
}

---
### Output 1: Xiaohongshu (XHS)
**Language:** Chinese (Simplified)
**Structure:**
1. 📌 Title: Catchy, click-bait style, MUST be under 20 characters (including emojis).
2. 📝 Content: Educational, structured with emojis (👇, 💡, 🤯), and friendly tone.
3. 🏷️ Tags: 10-15 relevant Chinese tags.
**CRITICAL CONSTRAINTS:**
- **NO LaTeX:** Never use \`$\` symbols. You MUST use Unicode characters for math (e.g., use x², √x, ÷, ±, π, θ). Ensure it displays correctly on mobile.
- **NO Metas:** Do NOT mention "Manim", "Python", or software names. Focus only on the math concepts.

---
### Output 2: TikTok
**Language:** English
**Structure:**
1. Description: Short, punchy hook (1-2 sentences) followed by a quick summary. Use a trending/viral tone.
2. Hashtags: EXACTLY 5 broad, high-volume English hashtags (Include: #math, #education, #learnontiktok, #fyp, #mathematics).
**CRITICAL CONSTRAINTS:**
- **NO LaTeX:** Never use \`$\` symbols. You MUST use Unicode characters for math (e.g., use x², √x, ÷, ±, π, θ). Ensure it displays correctly on mobile.
- **NO Metas:** Do NOT mention "Manim", "Python", or software names. Focus only on the math concepts.
`;

    let parts: any[] = [prompt];

    if (input.type === 'url') {
        // Fetch the video from the URL
        console.log("Fetching video from URL:", input.data);
        const response = await fetch(input.data);
        if (!response.ok) throw new Error(`Failed to fetch video from URL: ${response.statusText}`);
        
        const arrayBuffer = await response.arrayBuffer();
        console.log(`Fetched video size: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
        
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');
        const mimeType = input.mimeType || 'video/mp4'; // Fallback or detect

        parts.push({
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        });
    } else {
        // Base64
        const cleanBase64 = input.data.replace(/^data:.*\/.*;base64,/, "");
        parts.push({
            inlineData: {
                data: cleanBase64,
                mimeType: input.mimeType || 'video/mp4'
            }
        });
    }

    // Retry logic for 503 Overloaded errors
    const maxRetries = 3;
    let attempt = 0;
    let result;

    while (attempt < maxRetries) {
        try {
            console.log(`Attempt ${attempt + 1} of ${maxRetries} to generate content...`);
            result = await model.generateContent(parts);
            break; // Success!
        } catch (e: any) {
            attempt++;
            console.warn(`Attempt ${attempt} failed with error:`, e.message);
            
            // If it's the last attempt, throw the error
            if (attempt >= maxRetries) throw e;

            // If it is a 503 (Overloaded) or similar transient error, wait and retry
            if (e.message.includes('503') || e.message.includes('overloaded') || e.message.includes('fetch failed')) {
                const delay = 1000 * Math.pow(2, attempt); // Exponential backoff: 2s, 4s, 8s...
                console.log(`Waiting ${delay}ms before retrying...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                 // If it's not a retryable error (e.g., 400 Bad Request), throw immediately
                 throw e;
            }
        }
    }

    if (!result) throw new Error("Failed to generate content after multiple retries.");

    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting if model ignores instruction
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      throw new Error("AI response was not valid JSON: " + text.substring(0, 100));
    }

  } catch (error: any) {
    console.error("Error generating content:", error);
    // Return the actual error message for debugging
    throw new Error(error.message || "Unknown error occurred");
  }
}
