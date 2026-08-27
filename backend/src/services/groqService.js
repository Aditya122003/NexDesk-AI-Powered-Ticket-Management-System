const Groq = require('groq-sdk');

const analyzeTicketWithGroq = async (title, description) => {
  const apiKey = process.env.GROQ_API_KEY;

  const fallbackResult = {
    category: 'Uncategorized',
    priority: 'Medium',
    reasoning: 'AI Classifier was uncertain or offline. Ticket assigned to Uncategorized for Admin review.',
    suggestedSummary: title ? `${title}: ${description.substring(0, 100)}...` : 'Ticket request',
    isAiSuccess: false
  };

  if (!apiKey) {
    console.warn('[GroqService] GROQ_API_KEY is not set. Using Uncategorized fallback.');
    return fallbackResult;
  }

  try {
    const groq = new Groq({ apiKey });

    const prompt = `You are an AI Support Ticket Classifier for an enterprise helpdesk system.
Analyze the following customer support ticket and classify it accurately.

Ticket Title: "${title}"
Ticket Description: "${description}"

Categories available (MUST pick EXACTLY one):
- Technical (bugs, system crashes, errors, integration issues)
- Billing (payments, invoices, subscriptions, refunds, pricing)
- Account (login, password reset, profile, permissions, 2FA)
- Feature Request (new feature ideas, enhancements, suggestions)
- General (inquiries, feedback, general questions)
- Uncategorized (if uncertain, unclear, or insufficient detail to determine exact category)

Priorities available (MUST pick EXACTLY one):
- Urgent (system down, security breach, severe business impact)
- High (critical functionality broken, work blocked for multiple users)
- Medium (feature issue with workaround, standard question)
- Low (cosmetic issues, minor questions, feature suggestions)

Return ONLY valid JSON matching this exact structure with no extra text or markdown formatting:
{
  "category": "Technical" | "Billing" | "Account" | "Feature Request" | "General" | "Uncategorized",
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "reasoning": "Brief 1-2 sentence explanation of why this category and priority were selected.",
  "suggestedSummary": "A concise 1-line summary of the core issue."
}`;

    let completion;
    const primaryModels = ['groq/compound-mini', 'groq/compound', 'qwen/qwen3.6-27b'];
    let lastErr;

    for (const modelName of primaryModels) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a JSON-only responder. Always respond with strict valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: modelName,
          temperature: 0.2,
          max_tokens: 350
        });
        if (completion?.choices?.[0]?.message?.content) {
          break;
        }
      } catch (err) {
        lastErr = err;
        console.warn(`[GroqService] Model ${modelName} failed, trying fallback model...`);
      }
    }

    if (!completion?.choices?.[0]?.message?.content) {
      throw lastErr || new Error('All Groq models failed to return content');
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('Empty response from Groq');

    const parsed = JSON.parse(content);

    // Validate category
    const validCategories = ['Technical', 'Billing', 'Account', 'Feature Request', 'General', 'Uncategorized'];
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];

    const category = validCategories.includes(parsed.category) ? parsed.category : 'Uncategorized';
    const priority = validPriorities.includes(parsed.priority) ? parsed.priority : 'Medium';

    return {
      category,
      priority,
      reasoning: parsed.reasoning || 'Auto-classified using Groq LLM',
      suggestedSummary: parsed.suggestedSummary || title,
      isAiSuccess: category !== 'Uncategorized'
    };
  } catch (error) {
    console.error('[GroqService] Groq API call error:', error.message);
    return fallbackResult;
  }
};

module.exports = { analyzeTicketWithGroq };
