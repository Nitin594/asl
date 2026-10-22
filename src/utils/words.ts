// Common English words for autocomplete suggestions during fingerspelling
export const COMMON_WORDS = [
  "HELLO", "HELP", "HOW", "HAVE", "HERE", "HAPPY", "HOME",
  "THANK", "THANKS", "TIME", "TODAY", "THAT", "THIS", "THE", "THEY", "THERE",
  "PLEASE", "PEOPLE", "PLAY",
  "YES", "YOU", "YOUR", "YEAR",
  "NO", "NAME", "NICE", "NEED", "NOW",
  "GOOD", "GREAT", "GIVE", "GO",
  "MORNING", "MEET", "MAKE", "MORE", "MY",
  "SEE", "SIGN", "SORRY", "SMILE", "STOP", "SOME",
  "WHAT", "WHERE", "WHEN", "WHO", "WHY", "WATER", "WITH", "WORK", "WORLD",
  "FRIEND", "FAMILY", "FOOD", "FOR", "FROM",
  "LOVE", "LIKE", "LIFE", "LOOK",
  "DAY", "DO", "DEAF",
  "COME", "CAN", "COULD",
  "AGAIN", "ALL", "AND", "ARE", "ABOUT",
  "WELCOME", "WANT", "WELL"
];

export function getWordSuggestions(prefix: string, maxResults = 4): string[] {
  if (!prefix || prefix.length < 1) return [];
  const upper = prefix.toUpperCase();
  const matches = COMMON_WORDS.filter(w => w.startsWith(upper) && w !== upper);
  return matches.slice(0, maxResults);
}

