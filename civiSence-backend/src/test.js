import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const models = await groq.models.list();

console.log("\nAVAILABLE MODELS:\n");

models.data.forEach(model => {
    console.log(model.id);
});