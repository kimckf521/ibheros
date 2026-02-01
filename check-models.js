
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyAWvQd4eqkVo7mnDkHmXuyZLnRJiPDWD5k"; // Using the fallback key from your code
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // There isn't a direct listModels on the client instance usually exposed this way in the simple node example without admin SDK,
    // but looking at the error message "Call ListModels to see the list", hopefully the SDK supports it or we can just try a generation to see if it works.
    // Actually, earlier SDK versions didn't have listModels easily accessible. 
    // Let's try to just run a simple generation with a few candidate names.
    
    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro"
    ];

    console.log("Checking model availability...");

    for (const modelName of candidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${modelName} is available.`);
        } catch (e) {
            console.log(`❌ FAILED: ${modelName} - ${e.message.split(']')[1] || e.message}`);
        }
    }

  } catch (error) {
    console.error("Script error:", error);
  }
}

listModels();
