import { Filter } from 'bad-words';

const filter = new Filter();

// Additional inappropriate terms related to image generation
const additionalBadWords = [
  'nude', 'naked', 'nsfw', 'porn', 'sexual', 'explicit', 'adult',
  'violence', 'gore', 'blood', 'weapon', 'gun', 'knife', 'kill',
  'hate', 'racist', 'discriminatory', 'offensive', 'harassment',
  'drug', 'illegal', 'criminal', 'terrorist', 'bomb', 'explosive'
];

filter.addWords(...additionalBadWords);

export interface PromptValidationResult {
  isValid: boolean;
  sanitizedPrompt?: string;
  warnings: string[];
  blockedTerms: string[];
}

export function validateAndSanitizePrompt(prompt: string): PromptValidationResult {
  const warnings: string[] = [];
  const blockedTerms: string[] = [];
  
  // Basic validation
  if (!prompt || prompt.trim().length === 0) {
    return {
      isValid: false,
      warnings: ['Prompt cannot be empty'],
      blockedTerms: [],
    };
  }

  if (prompt.length > 1000) {
    return {
      isValid: false,
      warnings: ['Prompt is too long (maximum 1000 characters)'],
      blockedTerms: [],
    };
  }

  // Check for inappropriate content
  const cleanPrompt = filter.clean(prompt);
  const hasProfanity = cleanPrompt !== prompt;
  
  if (hasProfanity) {
    // Find the blocked terms
    const words = prompt.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (filter.isProfane(word)) {
        blockedTerms.push(word);
      }
    });
    
    return {
      isValid: false,
      warnings: [
        'Your prompt contains inappropriate content that cannot be used for image generation.',
        'Please modify your prompt to remove offensive, explicit, violent, or illegal content.',
        'We aim to create a safe and positive environment for all users.'
      ],
      blockedTerms,
    };
  }

  // Additional checks for potentially problematic patterns
  const harmfulPatterns = [
    /real\s+person/i,
    /celebrity/i,
    /public\s+figure/i,
    /copyrighted/i,
    /trademarked/i,
    /brand\s+logo/i,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(prompt)) {
      warnings.push('Consider avoiding references to real people, celebrities, or copyrighted content.');
      break;
    }
  }

  // Check for very short prompts
  if (prompt.trim().length < 3) {
    warnings.push('Very short prompts may not produce good results. Consider adding more details.');
  }

  return {
    isValid: true,
    sanitizedPrompt: prompt.trim(),
    warnings,
    blockedTerms: [],
  };
}

export function generateSafePromptSuggestions(): string[] {
  return [
    'A beautiful landscape with mountains and a lake',
    'A cute cartoon animal in a forest',
    'Abstract geometric patterns in bright colors',
    'A cozy coffee shop interior with warm lighting',
    'A futuristic city skyline at sunset',
    'A peaceful garden with flowers and butterflies',
    'A minimalist room with modern furniture',
    'A fantasy castle on a floating island',
    'A vintage bicycle in front of a bookstore',
    'A serene beach scene with palm trees'
  ];
}
