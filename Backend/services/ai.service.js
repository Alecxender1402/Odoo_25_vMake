import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiConfig = {
  temperature: 0,
  maxOutputTokens: 100,
};

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', geminiConfig });

export const checkTagRelevancy = async (title, description, tags) => {
  console.log('--- CALLING GEMINI AI FOR RELEVANCY CHECK ---');

  const tagList = tags.join(', ');
  const prompt = `
    Analyze the following code-related description and the provided tags. Your task is to determine if the tags accurately represent the main topics or technologies in the description.

    Title: "${title}"
    Description: "${description}"
    Tags: [${tagList}]

    Respond with only the word "true" if the tags are relevant, or "false" if they are not. Do not provide any explanation.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toLowerCase();

    console.log(`Gemini AI Raw Response: "${text}"`);

    if (text === 'true') {
      console.log('AI Check Result: Relevant');
      return true;
    }
    if (text === 'false') {
      console.log('AI Check Result: Not Relevant');
      return false;
    }

    console.warn('AI gave an unexpected response. Defaulting to relevant.');
    return true;
  } catch (error) {
    console.error('Error calling Gemini AI:', error.message);

    return true;
  }
};
