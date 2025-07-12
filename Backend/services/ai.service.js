import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiConfig = {
  temperature: 0,
  maxOutputTokens: 100,
};

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', geminiConfig });

// Simple tag relevancy check service
// This is a placeholder for AI-powered tag suggestions

export const checkTagRelevancy = async (title, description, tags) => {
  // For now, this is a simple implementation
  // In a real application, this could use AI/ML to suggest relevant tags
  
  const titleWords = title.toLowerCase().split(' ');
  const descWords = description.toLowerCase().split(' ');
  const allWords = [...titleWords, ...descWords];
  
  // Simple keyword matching for common technologies
  const suggestions = [];
  
  const techKeywords = {
    'JavaScript': ['javascript', 'js', 'node', 'npm', 'yarn'],
    'React': ['react', 'jsx', 'component', 'hook', 'state'],
    'Node.js': ['node', 'nodejs', 'express', 'server', 'backend'],
    'Python': ['python', 'py', 'django', 'flask', 'pip'],
    'CSS': ['css', 'style', 'styling', 'layout', 'flexbox', 'grid'],
    'HTML': ['html', 'dom', 'element', 'tag', 'markup'],
    'MongoDB': ['mongo', 'mongodb', 'database', 'collection', 'document'],
    'SQL': ['sql', 'database', 'query', 'table', 'join'],
    'Docker': ['docker', 'container', 'dockerfile', 'image'],
    'AWS': ['aws', 'amazon', 'cloud', 'ec2', 's3', 'lambda']
  };
  
  for (const [tech, keywords] of Object.entries(techKeywords)) {
    const hasKeyword = keywords.some(keyword => 
      allWords.some(word => word.includes(keyword))
    );
    
    if (hasKeyword && !tags.includes(tech)) {
      suggestions.push(tech);
    }
  }
  
  return {
    suggestions: suggestions.slice(0, 3), // Limit to 3 suggestions
    relevancyScore: Math.min(suggestions.length / 3, 1) // Simple relevancy score
  };
};
