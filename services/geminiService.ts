import { GoogleGenAI, Type, Schema } from "@google/genai";
import { IncomeIdea, UserProfile, DetailedPlan, Difficulty } from "../types";

// Initialize Gemini Client
// CRITICAL: process.env.API_KEY is handled by the runtime environment.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const generatePassiveIncomeIdeas = async (profile: UserProfile): Promise<IncomeIdea[]> => {
  const prompt = `
    Generate 5 distinct, viable, and modern passive income business ideas based on this user profile:
    - Skills: ${profile.skills}
    - Available Budget: ${profile.budget}
    - Time Commitment: ${profile.timeCommitment}
    - Interests: ${profile.interests}

    Focus on digital products, SaaS, content creation, dropshipping, or investment strategies that fit the constraints.
    Ensure the estimated revenue is realistic for the first 6 months.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
        estimatedMonthlyRevenue: { type: Type.STRING },
        setupCost: { type: Type.STRING },
        timeToRevenue: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['id', 'title', 'description', 'difficulty', 'estimatedMonthlyRevenue', 'setupCost', 'timeToRevenue', 'tags']
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert business consultant and entrepreneur. You provide realistic, actionable, and data-backed business ideas."
      }
    });

    const text = response.text;
    if (!text) return [];

    // Validate output structure vaguely before returning, though schema ensures it mostly.
    return JSON.parse(text) as IncomeIdea[];
  } catch (error) {
    console.error("Failed to generate ideas:", error);
    // Fallback mock data in case of critical API failure or rate limit for demo purposes
    return [];
  }
};

export const generateRefinementQuestions = async (idea: IncomeIdea): Promise<string[]> => {
  const prompt = `
    I want to execute this business idea: "${idea.title}".
    Description: ${idea.description}
    
    Ask me 3 critical short questions that will help you (the AI) create a more specific and successful business plan for me. 
    Focus on niche, specific skills, or distribution channels.
    Return just the questions as strings.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
    required: ['questions']
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) return ["What is your target audience?", "Do you have existing tools?", "What is your main goal?"];

    const result = JSON.parse(text);
    return result.questions;
  } catch (error) {
    console.error("Failed to generate questions:", error);
    return ["What specific niche do you want to target?", "How do you plan to find your first customer?", "Do you have any existing audience?"];
  }
};

export const generateBusinessPlan = async (
  idea: IncomeIdea,
  profile: UserProfile,
  refinementContext: Record<string, string> = {}
): Promise<DetailedPlan> => {
  // Convert refinement answers to string
  const contextString = Object.entries(refinementContext)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join('\n\n');

  const prompt = `
    Create a detailed launch plan for this passive income idea: "${idea.title}".
    Context: ${idea.description}
    
    The user has the following profile (Strictly use this to tailor the steps):
    - Skills: ${profile.skills} (Leverage these skills in the execution phases)
    - Budget: ${profile.budget} (Ensure the plan fits this budget)
    - Time: ${profile.timeCommitment} (Ensure tasks are manageable within this time)
    
    User Specific Refinement Answers:
    ${contextString}
    
    I need:
    1. An executive overview incorporating the user's specific answers and constraints.
    2. A specific marketing strategy.
    3. 3 distinct execution phases (e.g., Setup, Launch, Scale) with actionable tasks.
    4. A projected 6-month financial forecast (Month 1 to Month 6) with estimated revenue, expenses, and profit.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      ideaId: { type: Type.STRING },
      overview: { type: Type.STRING },
      marketingStrategy: { type: Type.STRING },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            phase: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['phase', 'tasks']
        }
      },
      projections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            month: { type: Type.STRING },
            revenue: { type: Type.NUMBER },
            expenses: { type: Type.NUMBER },
            profit: { type: Type.NUMBER }
          },
          required: ['month', 'revenue', 'expenses', 'profit']
        }
      }
    },
    required: ['ideaId', 'overview', 'marketingStrategy', 'steps', 'projections']
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a strategic business planner. Be specific, avoid fluff. Use realistic financial numbers based on the user's budget and skills."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const plan = JSON.parse(text) as DetailedPlan;
    // Ensure the ID matches so the UI links correctly
    plan.ideaId = idea.id;
    return plan;
  } catch (error) {
    console.error("Failed to generate plan:", error);
    throw error;
  }
};