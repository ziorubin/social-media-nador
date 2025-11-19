import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MarketingCampaign, BrandConfig, SocialPlatform } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Analyze the image using Gemini 2.5 Flash.
 * This provides a fast, detailed visual context for the thinking model.
 */
export const analyzeImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Analyze this image in extreme detail for a marketing campaign. Describe visual elements, mood, colors, lighting, objects, people, and any text present. Focus on details that would be relevant for creating engaging social media content.",
          },
        ],
      },
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

/**
 * Step 2: Generate Marketing Strategy using Gemini 3 Pro with Thinking.
 * Takes the image analysis, user instructions, and brand config to create the final content.
 */
export const generateMarketingContent = async (
  imageAnalysis: string,
  userInstructions: string,
  brandConfig: BrandConfig
): Promise<MarketingCampaign> => {
  try {
    // Filter enabled platforms (based on isConnected)
    const activePlatforms = Object.entries(brandConfig.credentials)
      .filter(([_, creds]) => creds.isConnected)
      .map(([platform]) => platform);

    // Default fallback if nothing selected (though UI prevents this)
    const platformsToGenerate = activePlatforms.length > 0 
      ? activePlatforms 
      : ['Instagram', 'LinkedIn', 'Twitter', 'Facebook', 'TikTok'];

    const prompt = `
      ACT AS A WORLD-CLASS CREATIVE DIRECTOR AND SOCIAL MEDIA STRATEGIST.
      
      CONTEXT:
      The user has provided an image (described below), specific instructions, and brand guidelines.
      Your goal is to create a high-impact social media content package including visual direction.
      
      IMAGE DESCRIPTION:
      ${imageAnalysis}
      
      COMPANY BACKGROUND:
      ${brandConfig.companyBackground || "Not specified."}

      TARGET AUDIENCE:
      ${brandConfig.targetAudience || "General audience."}

      TONE OF VOICE:
      ${brandConfig.toneOfVoice || "Professional but engaging."}

      STRICT CONTENT GENERATION RULES:
      ${brandConfig.contentRules || "Standard professional marketing best practices."}

      CAMPAIGN INSTRUCTIONS:
      ${userInstructions}
      
      TASK:
      Create professional social media posts ONLY for the following platforms: ${platformsToGenerate.join(', ')}.
      
      PLATFORM GUIDES:
      - Instagram: Focus on visual storytelling, engaging captions.
      - LinkedIn: Professional tone, industry insights, value-driven.
      - Twitter: Punchy, thread-style if complex, viral potential.
      - TikTok: Short, engaging script concept or caption for a video.
      - Facebook: Community focused, engaging.
      - Email: Subject line (in 'subject' field) + Body content. Warm, personal, conversion-focused. No hashtags.

      REQUIREMENTS:
      - Detect the language of the User Instructions/Company Info. If they are in Italian, generate the response in Italian. If English, use English.
      - Provide a "Strategic Insight" explaining the overall campaign angle.
      - For each requested platform, provide the content text, relevant hashtags (except Email), AND a specific "imagePrompt".
      - The "imagePrompt" will be used to generate a NEW AI image for that specific post. It should describe a high-quality, photorealistic image that fits the platform's aesthetic AND keeps the visual identity/theme of the original image.
      - CRITICAL: The "imagePrompt" MUST be a direct visual description (e.g. "A sunny beach with a coffee cup", NOT "Generate an image of...").

      JSON SCHEMA:
      Return ONLY valid JSON matching the schema below.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategicInsight: { type: Type.STRING, description: "Overall strategic direction and why this approach works." },
            posts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { 
                    type: Type.STRING, 
                    enum: ["Instagram", "LinkedIn", "Twitter", "Facebook", "TikTok", "Email"] 
                  },
                  subject: { type: Type.STRING, description: "Email Subject line (Only for Email platform)" },
                  content: { type: Type.STRING, description: "The post caption or email body." },
                  hashtags: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "A list of 5-15 relevant hashtags (Empty for Email)."
                  },
                  tips: { type: Type.STRING, description: "Brief specific tip for this platform post." },
                  imagePrompt: { 
                    type: Type.STRING, 
                    description: "A detailed prompt to generate a photorealistic image for this post using Imagen 3. It should be based on the original image theme but optimized for the platform." 
                  }
                },
                required: ["platform", "content", "hashtags", "imagePrompt"]
              }
            }
          },
          required: ["strategicInsight", "posts"]
        }
      },
    });

    if (response.text) {
      const rawData = JSON.parse(response.text);
      // Add default status 'draft' to posts
      const campaign: MarketingCampaign = {
        strategicInsight: rawData.strategicInsight,
        posts: rawData.posts.map((p: any) => ({
          ...p,
          status: 'draft'
        }))
      };
      
      // Double check filter
      campaign.posts = campaign.posts.filter(p => platformsToGenerate.includes(p.platform));
      return campaign;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate marketing content. Please try again.");
  }
};

/**
 * Step 3: Generate visual assets using Imagen 4 -> Imagen 3 -> Gemini Flash Image
 */
export const generateSocialImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  if (!prompt) return "";
  
  // Clean prompt: Remove common conversational prefixes that confuse image models
  const cleanPrompt = prompt
    .replace(/^(create|generate|make|draw|render) (an? )?(image|photo|picture|visual) of /i, '')
    .trim();

  try {
    // Attempt 1: Imagen 4 (Highest Quality)
    try {
      console.log("Attempting Imagen 4 generation...");
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: cleanPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio as any,
          outputMimeType: 'image/jpeg'
        },
      });

      const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (base64ImageBytes) {
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
      throw new Error("No image generated from Imagen 4");
    } catch (error) {
      console.warn("Imagen 4 failed, trying fallback (Imagen 3):", error);
    }

    // Attempt 2: Imagen 3 (High Quality, Backup)
    try {
      console.log("Attempting Imagen 3 generation...");
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: cleanPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatio as any,
          outputMimeType: 'image/jpeg'
        },
      });

      const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
      if (base64ImageBytes) {
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      }
      throw new Error("No image generated from Imagen 3");
    } catch (error) {
      console.warn("Imagen 3 failed, trying final fallback (Flash Image):", error);
    }
    
    // Attempt 3: Gemini 2.5 Flash Image (General Availability)
    console.log("Attempting Gemini 2.5 Flash Image generation...");
    const enhancedPrompt = `High quality photorealistic image. Aspect ratio ${aspectRatio.replace(':', ' by ')}. ${cleanPrompt}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
      config: {
          responseModalities: [Modality.IMAGE], 
      },
    });

    // Extract image from response
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn("No image data in final fallback response");
    return "";
    
  } catch (error) {
    console.error("All image generation attempts failed completely:", error);
    return "";
  }
};