import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiClient {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found. LLM features will be disabled.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 200,
        },
      });
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      this.genAI = null;
      this.model = null;
    }
  }

  /**
   * Generate text using Gemini
   */
  async generateText(prompt: string): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini AI not initialized. Check your API key.');
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini API error:', error);
      
      // Handle specific errors
      if (error.message?.includes('API key')) {
        throw new Error('Invalid Gemini API key');
      }
      
      throw new Error('Failed to generate response from Gemini');
    }
  }

  /**
   * Check if Gemini is available
   */
  isAvailable(): boolean {
    return this.model !== null;
  }
}

// Singleton instance
export const geminiClient = new GeminiClient();
