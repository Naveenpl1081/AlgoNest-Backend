import axios from "axios";
import { IAITutorRepository, IConversationMessage } from "../interfaces/Irepositories/IaiTutorRepository";

interface CustomError extends Error {
  type: string;
  retryAfter?: number;
}

export class AITutorRepository implements IAITutorRepository {
  private groqApiKey: string;
  private maxTokens = 2000;
  private temperature = 0.7;

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || "";
    
    if (!this.groqApiKey) {
      console.warn("⚠️ GROQ_API_KEY not found. AI Tutor will use fallback responses.");
    }
  }

  async getChatResponse({
    message,
    conversationHistory,
    language = "general",
    topic
  }: {
    message: string;
    conversationHistory: IConversationMessage[];
    language?: string;
    topic?: string;
  }): Promise<{
    response: string;
    suggestions?: string[];
    relatedTopics?: string[];
    codeExamples?: string[];
  }> {
    
    if (this.groqApiKey) {
      try {
        return await this.getGroqTutorResponse(message, conversationHistory, language, topic);
      } catch (error: any) {
        console.error("Groq API failed:", error.message);
        
        if (error.response?.status === 429) {
          const customError = new Error("AI Tutor is currently busy. Please try again in a moment.") as CustomError;
          customError.type = 'RATE_LIMITED';
          customError.retryAfter = 60;
          throw customError;
        }
      }
    }

   
    return this.getFallbackResponse(message, language);
  }

  private async getGroqTutorResponse(
    message: string,
    conversationHistory: IConversationMessage[],
    language: string,
    topic?: string
  ): Promise<{
    response: string;
    suggestions?: string[];
    relatedTopics?: string[];
    codeExamples?: string[];
  }> {
    
    const systemPrompt = this.buildSystemPrompt(language, topic);
    
   
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    const models = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "gemma2-9b-it"
    ];

    for (const model of models) {
      try {
        console.log(`🤖 Using Groq model: ${model}`);
        const groqApi=process.env.GROQ_API
        if(!groqApi){
          return {response:"not get grokapi"}
        }

        const response = await axios.post(
          groqApi,
          {
            messages: messages,
            model: model,
            max_tokens: this.maxTokens,
            temperature: this.temperature,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.groqApiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );

        const aiResponse = response.data?.choices?.[0]?.message?.content;
        
        if (!aiResponse) {
          throw new Error("Empty response from AI");
        }

        console.log(` Success with model: ${model}`);
        
        return this.parseAIResponse(aiResponse, message);

      } catch (error: any) {
        console.error(` Model ${model} failed:`, error.response?.data?.error?.message || error.message);
        
        if (model === models[models.length - 1]) {
          throw error;
        }
        continue;
      }
    }

    throw new Error("All AI models failed");
  }

  private buildSystemPrompt(language: string, topic?: string): string {
    const basePrompt = `You are an expert programming tutor know as AlgoTutor who helps students learn coding concepts, algorithms, and problem-solving skills. Your teaching style is:

1. **Patient & Encouraging**: Always supportive, never condescending
2. **Clear & Simple**: Explain complex concepts in easy-to-understand terms
3. **Interactive**: Ask guiding questions to help students think critically
4. **Practical**: Provide real-world examples and analogies
5. **Step-by-Step**: Break down problems into manageable pieces

**Your Responsibilities:**
- Explain programming concepts clearly with examples
- Help build problem-solving logic and algorithmic thinking
- Guide students through debugging without giving direct answers
- Teach best practices and coding patterns
- Suggest learning resources and practice problems
- Support multiple programming languages

**Teaching Guidelines:**
- Use analogies and real-world examples
- Encourage students to think through problems
- Provide hints before full solutions
- Celebrate progress and effort
- Ask clarifying questions to understand their level
- Break complex topics into smaller concepts
- Use code examples with clear comments`;

    if (language && language !== "general") {
      return `${basePrompt}

**Current Focus**: Teaching ${language} programming
${topic ? `**Current Topic**: ${topic}` : ''}

Provide language-specific examples and best practices for ${language}.`;
    }

    return basePrompt;
  }

  private parseAIResponse(aiResponse: string, userMessage: string): {
    response: string;
    suggestions?: string[];
    relatedTopics?: string[];
    codeExamples?: string[];
  } {
   
    const codeBlocks = aiResponse.match(/```[\s\S]*?```/g);
    const codeExamples = codeBlocks?.map(block => 
      block.replace(/```\w*\n?|\n?```/g, '').trim()
    );

    
    const suggestionMatches = aiResponse.match(/(?:Try|Consider|You could|Suggestion).*?[:\n]((?:[-•*]\s*.+?\n)+)/gi);
    const suggestions = suggestionMatches?.flatMap(match => 
      match.split('\n')
        .filter(line => /^[-•*]\s+/.test(line.trim()))
        .map(line => line.replace(/^[-•*]\s+/, '').trim())
    );

  
    let cleanResponse = aiResponse;
    if (codeBlocks) {
      codeBlocks.forEach(block => {
        cleanResponse = cleanResponse.replace(block, '[Code example provided below]');
      });
    }

   
    const relatedTopics = this.extractRelatedTopics(aiResponse, userMessage);

    return {
      response: cleanResponse.trim(),
      suggestions: suggestions?.slice(0, 5),
      relatedTopics: relatedTopics?.slice(0, 4),
      codeExamples: codeExamples?.slice(0, 3)
    };
  }

  private extractRelatedTopics(response: string, userMessage: string): string[] | undefined {
    const topics: string[] = [];
    const responseLower = response.toLowerCase();
    const messageLower = userMessage.toLowerCase();

   
    const topicKeywords = {
      'arrays': ['array', 'list'],
      'strings': ['string', 'text', 'character'],
      'loops': ['loop', 'iteration', 'for', 'while'],
      'recursion': ['recursive', 'recursion'],
      'sorting': ['sort', 'bubble', 'quick', 'merge'],
      'searching': ['search', 'binary search', 'linear search'],
      'data structures': ['stack', 'queue', 'tree', 'graph', 'hash'],
      'algorithms': ['algorithm', 'complexity', 'big o'],
      'object-oriented': ['class', 'object', 'inheritance', 'polymorphism'],
      'functions': ['function', 'method', 'parameter']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const mentioned = keywords.some(keyword => 
        responseLower.includes(keyword) || messageLower.includes(keyword)
      );
      if (mentioned && !topics.includes(topic)) {
        topics.push(topic);
      }
    }

    return topics.length > 0 ? topics : undefined;
  }

  private getFallbackResponse(message: string, language: string): {
    response: string;
    suggestions?: string[];
    relatedTopics?: string[];
    codeExamples?: string[];
  } {
    const messageLower = message.toLowerCase();


    if (messageLower.includes('array') || messageLower.includes('list')) {
      return {
        response: "Arrays are fundamental data structures that store multiple values in a single variable. Think of an array like a row of mailboxes - each box has a number (index) and can hold something inside.\n\nIn most programming languages, arrays are zero-indexed, meaning the first element is at position 0. You can access elements by their index, add new elements, remove elements, and perform various operations like sorting or searching.",
        suggestions: [
          "Practice iterating through arrays with different loop types",
          "Learn common array methods: map, filter, reduce",
          "Understand the difference between array indexing in different languages",
          "Try solving basic array problems on coding platforms"
        ],
        relatedTopics: ["loops", "data structures", "algorithms", "sorting"],
        codeExamples: [
          "// JavaScript Array Example\nconst fruits = ['apple', 'banana', 'orange'];\nconsole.log(fruits[0]); // 'apple'\nfruits.push('grape'); // Add to end\nfruits.forEach(fruit => console.log(fruit));"
        ]
      };
    }

    if (messageLower.includes('loop') || messageLower.includes('iteration')) {
      return {
        response: "Loops allow you to repeat code multiple times. The three main types are:\n\n1. **For Loop**: When you know how many times to repeat\n2. **While Loop**: When you repeat until a condition becomes false\n3. **Do-While Loop**: Similar to while, but runs at least once\n\nThink of a loop like following a recipe that says 'stir 10 times' - you repeat the action a specific number of times.",
        suggestions: [
          "Practice converting between different loop types",
          "Watch out for infinite loops - always ensure your condition will eventually be false",
          "Learn when to use each loop type",
          "Understand loop control: break and continue"
        ],
        relatedTopics: ["arrays", "strings", "algorithms", "iteration patterns"],
        codeExamples: [
          "// For loop example\nfor (let i = 0; i < 5; i++) {\n  console.log(i); // Prints 0,1,2,3,4\n}\n\n// While loop example\nlet count = 0;\nwhile (count < 5) {\n  console.log(count);\n  count++;\n}"
        ]
      };
    }

    if (messageLower.includes('function') || messageLower.includes('method')) {
      return {
        response: "Functions are reusable blocks of code that perform specific tasks. Think of them as mini-programs within your program.\n\nKey concepts:\n- **Parameters**: Input values the function receives\n- **Return value**: Output the function produces\n- **Scope**: Variables inside functions are typically local\n- **Reusability**: Write once, use many times\n\nGood functions do one thing well and have clear, descriptive names.",
        suggestions: [
          "Practice writing small, focused functions",
          "Use descriptive names that explain what the function does",
          "Understand the difference between parameters and arguments",
          "Learn about function scope and closures"
        ],
        relatedTopics: ["scope", "parameters", "return values", "recursion"],
        codeExamples: [
          "// Function example\nfunction addNumbers(a, b) {\n  return a + b;\n}\n\nconst result = addNumbers(5, 3);\nconsole.log(result); // 8"
        ]
      };
    }

    
    return {
      response: `I'm here to help you learn programming! I can assist with:\n\n• **Concepts**: Explain algorithms, data structures, and programming principles\n• **Logic Building**: Help you think through problem-solving approaches\n• **Code Understanding**: Break down complex code into simpler parts\n• **Debugging**: Guide you to find and fix issues in your code\n• **Best Practices**: Teach you how to write clean, efficient code\n\nWhat specific topic or problem would you like to explore? Feel free to ask about any programming concept, share code you're working on, or describe a problem you're trying to solve!`,
      suggestions: [
        "Ask about specific programming concepts (arrays, loops, functions, etc.)",
        "Share code you're struggling with for guided help",
        "Describe a problem you're trying to solve",
        "Ask for practice problems or learning resources"
      ],
      relatedTopics: ["arrays", "loops", "functions", "algorithms", "data structures"]
    };
  }
}