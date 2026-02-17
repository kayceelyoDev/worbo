// app/api/wordnik/route.ts
import { NextResponse } from 'next/server';

// Simple in-memory cache
let wordCache: { word: string; definition: string; timestamp: number } | null = null;
const CACHE_DURATION = 5000; // 5 seconds - adjust as needed

export async function GET() {
  const apiKey = process.env.WORDNIK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'WORDNIK_API_KEY is not configured' },
      { status: 500 }
    );
  }

  // Return cached word if still valid
  if (wordCache && Date.now() - wordCache.timestamp < CACHE_DURATION) {
    console.log('✅ Returning cached word:', wordCache.word);
    return NextResponse.json({
      word: wordCache.word,
      definition: wordCache.definition,
    });
  }

  try {
    // Single request approach - slower but respects rate limits
    console.log('🔄 Fetching new word from Wordnik...');
    
    const wordUrl = `https://api.wordnik.com/v4/words.json/randomWord?` +
      `hasDictionaryDef=true&` +
      `includePartOfSpeech=noun,verb,adjective&` +
      `minCorpusCount=100000&` +
      `minDictionaryCount=5&` +
      `minLength=5&` +
      `maxLength=5&` +
      `api_key=${apiKey}`;

    const wordResponse = await fetch(wordUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    if (!wordResponse.ok) {
      const errorBody = await wordResponse.text();
      console.error('❌ Word fetch failed:', wordResponse.status, errorBody);
      
      if (wordResponse.status === 429) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded. Please try again in a moment.',
            retryAfter: 60 // seconds
          },
          { 
            status: 429,
            headers: {
              'Retry-After': '60'
            }
          }
        );
      }
      
      throw new Error(`Word fetch failed: ${wordResponse.status}`);
    }

    const wordData = await wordResponse.json();
    const word = wordData.word?.toLowerCase();

    if (!word || word.length !== 5) {
      throw new Error('Invalid word received');
    }

    console.log('📖 Got word:', word);

    // Fetch definition
    const defUrl = `https://api.wordnik.com/v4/word.json/${word}/definitions?` +
      `limit=5&` +
      `useCanonical=true&` +
      `api_key=${apiKey}`;

    const defResponse = await fetch(defUrl, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    if (!defResponse.ok) {
      const errorBody = await defResponse.text();
      console.error('❌ Definition fetch failed:', defResponse.status, errorBody);
      
      if (defResponse.status === 429) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded. Please try again in a moment.',
            retryAfter: 60
          },
          { 
            status: 429,
            headers: {
              'Retry-After': '60'
            }
          }
        );
      }
      
      throw new Error(`Definition fetch failed: ${defResponse.status}`);
    }

    const definitions = await defResponse.json();
    console.log('📚 Definitions found:', definitions.length);

    const validDef = definitions.find((def: any) => {
      const text = def.text || '';
      return text.length > 10 && text.length < 250;
    });

    if (!validDef?.text) {
      throw new Error('No valid definition found');
    }

    const result = {
      word: word.toUpperCase(),
      definition: validDef.text.trim(),
    };

    // Cache the result
    wordCache = {
      ...result,
      timestamp: Date.now(),
    };

    console.log('✅ Success! Word:', result.word);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch word from Wordnik API',
        message: error.message
      },
      { status: 500 }
    );
  }
}