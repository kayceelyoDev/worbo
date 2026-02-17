import { NextResponse } from 'next/server';

const WORD_LENGTH = 5;

// --- Word Fetching Logic ---

async function fetchRandomWord(): Promise<string> {
  const sources = [
    // 1. Random Word API
    async () => {
      const res = await fetch(`https://random-word-api.vercel.app/api?words=1&length=${WORD_LENGTH}`);
      if (!res.ok) throw new Error('Random Word API failed');
      const data = await res.json();
      return data[0]?.toUpperCase();
    },
    // 2. Datamuse API (fallback)
    async () => {
        // Fetch a random letter to start with to get variety
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
        const res = await fetch(`https://api.datamuse.com/words?sp=${randomLetter}????&max=20`);
        if (!res.ok) throw new Error('Datamuse API failed');
        const data = await res.json();
        const validWords = data
            .filter((item: any) => item.word.length === WORD_LENGTH && /^[a-zA-Z]+$/.test(item.word))
            .map((item: any) => item.word.toUpperCase());
        
        if (validWords.length === 0) throw new Error('No valid words found');
        return validWords[Math.floor(Math.random() * validWords.length)];
    }
  ];

  for (const source of sources) {
    try {
      const word = await source();
      if (word && word.length === WORD_LENGTH && /^[A-Z]+$/.test(word)) {
        return word;
      }
    } catch (e) {
      console.warn('Word source failed:', e);
      continue;
    }
  }

  // Final fallback list of common 5-letter words
  const fallbackWords = [
    "APPLE", "BEACH", "BRAIN", "BREAD", "BRUSH", "CHAIR", "CHEST", "CHORD",
    "CLICK", "CLOCK", "CLOUD", "DANCE", "DIARY", "DRINK", "DRIVE", "EARTH",
    "FEAST", "FIELD", "FRUIT", "GLASS", "GRAPE", "GREEN", "GHOST", "HEART",
    "HOUSE", "JUICE", "LIGHT", "LEMON", "MELON", "MONEY", "MUSIC", "NIGHT",
    "PARTY", "PHONE", "PHOTO", "PIANO", "PILOT", "PLANE", "PLANT", "PLATE",
    "PHONE", "POWER", "RADIO", "RIVER", "ROBOT", "SHIRT", "SHOES", "SKIRT",
    "SNAKE", "SPACE", "SPOON", "STARS", "SUGAR", "TABLE", "TIGER", "TOAST",
    "TOUCH", "TRAIN", "TRUCK", "VOICE", "WATER", "WATCH", "WHALE", "WORLD",
    "WRITE", "YOUTH"
  ];
  return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
}

// --- Definition Fetching Logic ---

async function fetchDefinition(word: string): Promise<string> {
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!res.ok) throw new Error('Dictionary API failed');
        const data = await res.json();
        
        // Extract first valid definition
        const definition = data[0]?.meanings?.[0]?.definitions?.[0]?.definition;
        if (!definition) throw new Error('No definition found');

        return cleanDefinition(definition, word);
    } catch (e) {
        console.warn('Definition fetch failed:', e);
        return "A common five-letter word.";
    }
}

function cleanDefinition(definition: string, word: string): string {
    // 1. Remove the word itself from the definition to avoid spoilers
    const regex = new RegExp(word, 'gi');
    let cleaned = definition.replace(regex, '_____');

    // 2. Shorten if too long
    if (cleaned.length > 150) {
        cleaned = cleaned.substring(0, 147) + '...';
    }

    return cleaned;
}

// --- Main Handler ---

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode'); // 'easy' or null

  try {
    const word = await fetchRandomWord();
    
    let definition = null;
    if (mode === 'easy') {
        definition = await fetchDefinition(word);
    }

    return NextResponse.json({ 
        word, 
        definition 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch word' }, { status: 500 });
  }
}
