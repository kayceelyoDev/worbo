// File: app/api/dictionary/route.ts

import { NextResponse } from "next/server";

const definitionCache = new Map<string, { data: { text: string; source: string }; expiry: number }>();
const CACHE_TTL = 3600000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "Word parameter is required" }, { status: 400 });
  }

  const lower = word.toLowerCase().trim();
  console.log(`🔍 Request received for word: "${lower}"`);

  const cached = definitionCache.get(lower);
  if (cached && cached.expiry > Date.now()) {
    console.log("⚡ Cache HIT for:", lower);
    return NextResponse.json({
      word: lower,
      definition: cached.data.text,
      source: cached.data.source + " (cached)",
    });
  }

  try {
    const definition = await getDefinition(lower);
    
    definitionCache.set(lower, {
      data: definition,
      expiry: Date.now() + CACHE_TTL,
    });
    
    return NextResponse.json({
      word: lower,
      definition: definition.text,
      source: definition.source,
    });
  } catch (error: any) {
    console.error("💥 ERROR:", error.message);
    return NextResponse.json({
      word: lower,
      definition: `Related to "${lower}". Think about its context and meaning.`,
      source: "Fallback",
    });
  }
}

async function getDefinition(word: string): Promise<{ text: string; source: string }> {
  const results = await Promise.allSettled([
    tryFreeDictionaryAPI(word),
    tryWiktionaryAPI(word),
    tryWordsAPI(word),
    tryDatamuseAPI(word),
  ]);

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      const def = result.value;
      // Check if definition is too revealing
      if (!isTooRevealing(def.text, word)) {
        return def;
      }
    }
  }

  // All definitions too revealing, use obfuscated version
  return {
    text: obfuscateDefinition(word),
    source: "Obfuscated Definition",
  };
}

function isTooRevealing(definition: string, word: string): boolean {
  const lowerDef = definition.toLowerCase();
  const lowerWord = word.toLowerCase();
  
  // Too short = likely too direct
  if (definition.length < 15) {
    return true;
  }
  
  // Contains exact word
  if (lowerDef.includes(lowerWord)) {
    return true;
  }
  
  // Check for common direct synonyms
  const directSynonyms = {
    frown: ['grimace', 'scowl', 'frown', 'furrow'],
    smile: ['grin', 'smirk', 'beam', 'smile'],
    cat: ['feline', 'kitten', 'tabby', 'mouser'],
    dog: ['canine', 'puppy', 'hound', 'pooch'],
  };
  
  const synonyms = (directSynonyms as any)[lowerWord] || [];
  for (const syn of synonyms) {
    if (lowerDef.includes(syn)) {
      return true;
    }
  }
  
  return false;
}

function obfuscateDefinition(word: string): string {
  const obfuscations: Record<string, string> = {
    frown: "An expression involving the facial features that usually appears when displeased or thinking hard.",
    smile: "A facial gesture that typically shows happiness, friendliness, or amusement.",
    laugh: "A vocal reaction expressing joy, humor, or amusement.",
    cry: "An emotional response involving tears and typically associated with sadness or strong feelings.",
    cat: "A small domesticated animal often kept as a pet, known for being independent.",
    dog: "A domesticated animal commonly kept as a companion, known for loyalty and companionship.",
  };
  
  const lower = word.toLowerCase();
  if (obfuscations[lower]) {
    return obfuscations[lower];
  }
  
  // Generic obfuscation for unknown words
  return `Think about what "${word}" relates to in everyday life. It's a common concept.`;
}

async function tryFreeDictionaryAPI(
  word: string,
  timeout = 3000
): Promise<{ text: string; source: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      { 
        next: { revalidate: 3600 },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();

    if (Array.isArray(data) && data[0]?.meanings?.[0]?.definitions?.[0]) {
      const definition = data[0].meanings[0].definitions[0].definition;
      console.log("📗 Free Dictionary:", definition);
      return {
        text: capitalize(shortenDefinition(definition)),
        source: "Free Dictionary API",
      };
    }
    return null;
  } catch (err) {
    console.log("❌ Free Dictionary API failed");
    return null;
  }
}

async function tryWiktionaryAPI(
  word: string,
  timeout = 3000
): Promise<{ text: string; source: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${word}`,
      { 
        next: { revalidate: 3600 },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();

    if (data?.en && Array.isArray(data.en) && data.en[0]?.definitions?.[0]) {
      const definition = data.en[0].definitions[0];
      console.log("📘 Wiktionary:", definition);
      return {
        text: capitalize(shortenDefinition(definition)),
        source: "Wiktionary API",
      };
    }
    return null;
  } catch (err) {
    console.log("❌ Wiktionary API failed");
    return null;
  }
}

async function tryWordsAPI(
  word: string,
  timeout = 3000
): Promise<{ text: string; source: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(
      `https://wordsapi.com/words/${word}`,
      { 
        next: { revalidate: 3600 },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();

    if (data?.meanings && Array.isArray(data.meanings) && data.meanings[0]?.definition) {
      const definition = data.meanings[0].definition;
      console.log("📙 WordsAPI:", definition);
      return {
        text: capitalize(shortenDefinition(definition)),
        source: "WordsAPI",
      };
    }
    return null;
  } catch (err) {
    console.log("❌ WordsAPI failed");
    return null;
  }
}

async function tryDatamuseAPI(
  word: string,
  timeout = 3000
): Promise<{ text: string; source: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(
      `https://api.datamuse.com/words?sp=${word}&md=d&max=1`,
      { 
        next: { revalidate: 3600 },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();

    if (Array.isArray(data) && data[0]?.defs?.[0]) {
      const definition = data[0].defs[0].split("\t")[1];
      if (definition) {
        console.log("📕 Datamuse:", definition);
        return {
          text: capitalize(definition),
          source: "Datamuse API",
        };
      }
    }
    return null;
  } catch (err) {
    console.log("❌ Datamuse API failed");
    return null;
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).trim();
}

function shortenDefinition(text: string): string {
  const sentences = text.split(/[.!?]+/);
  let firstSentence = sentences[0].trim();
  
  if (firstSentence.length > 150) {
    firstSentence = firstSentence.substring(0, 150).trim() + "...";
  }
  
  return firstSentence;
}