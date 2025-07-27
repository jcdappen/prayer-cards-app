import React from 'react';

interface CardContentProps {
  text: string;
}

const CardContent: React.FC<CardContentProps> = ({ text }) => {
  const BIBLE_REF_REGEX = /^((\d\s)?[A-Z\s]+(\s\d{1,3}:\d{1,3}(-\d{1,2})?)|([A-Z]+\s\d{1,3}:\d{1,3}(-\d{1,2})?)|(PSALM\s\d{1,3}:\d{1,3})|(GENESIS\s\d{1,3}:\d{1,3})|(LUKE\s\d{1,3}:\d{1,3})|(JOHN\s\d{1,3}:\d{1,3})|(REVELATION\s\d{1,3}:\d{1,3})|(ISAIAH\s\d{1,3}:\d{1,3})|(EXODUS\s\d{1,3}:\d{1,3})|(1\sTHESSALONIANS\s\d{1,3}:\d{1,3})|(1\sPETER\s\d{1,3}:\d{1,3})|(ZEPHANIAH\s\d{1,3}:\d{1,3})|(1\sCHRONICLES\s\d{1,3}:\d{1,3})|(2\sCORINTHIANS\s\d{1,3}:\d{1,3})|(HEBREWS\s\d{1,3}:\d{1,3})|(PHILIPPIANS\s\d{1,3}:\d{1,3})|(PROVERBS\s\d{1,3}:\d{1,3})|(2\sTIMOTHY\s\d{1,3}:\d{1,3})|(ROMANS\s\d{1,3}:\d{1,3})|(1\sSAMUEL\s\d{1,3}:\d{1,3})|(COLOSSIANS\s\d{1,3}:\d{1,3}(-\d{1,2})?)|(DEUTERONOMY\s\d{1,3}:\d{1,3})|(1\sJOHN\s\d{1,3}:\d{1,3})|(JEREMIAH\s\d{1,3}:\d{1,3})|(GALATIANS\s\d{1,3}:\d{1,3})|(MARK\s\d{1,3}:\d{1,3}(-\d{1,2})?)|(MATTHEW\s\d{1,3}:\d{1,3}(-\d{1,2})?)|(NUMBERS\s\d{1,3}:\d{1,3}(-\d{1,2})?)|(LAMENTATIONS\s\d{1,3}:\d{1,3}(-\d{1,2})?)|(JOSHUA\s\d{1,3}:\d{1,3}))$/;
  
  const IS_LIKELY_HEADING_REGEX = /^[A-Z\s&/]+$/;

  const content = text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return null;

    // Rule 1: Bible References
    if (BIBLE_REF_REGEX.test(trimmedLine)) {
      return <p key={index} className="text-right font-sans text-xs font-bold uppercase tracking-wider mt-2">{trimmedLine}</p>;
    }
    
    // Rule 2: Subtitles in brackets
    if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        return <h3 key={index} className="font-serif text-2xl text-center font-bold my-4">{trimmedLine.replace(/\[|\]/g, '')}</h3>;
    }
    
    // Rule 3: Main Titles (single, all-caps word)
    if (index < 2 && IS_LIKELY_HEADING_REGEX.test(trimmedLine) && !trimmedLine.includes(' ') && trimmedLine.length < 20) {
        return <h2 key={index} className="font-serif text-4xl text-center font-bold my-2">{trimmedLine}</h2>;
    }

    // Rule 4: Other ALL-CAPS headings
    if (IS_LIKELY_HEADING_REGEX.test(trimmedLine) && trimmedLine.length > 3) {
      return <h3 key={index} className="font-serif text-2xl text-center font-bold my-4">{trimmedLine}</h3>;
    }

    // Rule 5: Instructions in parentheses
    if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
        return <p key={index} className="text-center text-sm my-2 italic text-gray-500">{trimmedLine}</p>;
    }

    // Rule 6: Heuristic for list items (render as normal text)
    const wordCount = trimmedLine.split(/\s+/).length;
    if (wordCount <= 4) {
       const isLikelyPrayer = trimmedLine.includes('Jesus') || trimmedLine.includes('Lord') || trimmedLine.includes('God') || trimmedLine.includes('Father');
       // This handles short list items like "You are holy." or "Vastness of Creation"
       if (!isLikelyPrayer) {
         return <p key={index} className="text-center text-lg my-1 leading-normal">{trimmedLine}</p>;
       }
    }

    // Default Rule: Scripture text, prayers, and longer sentences are italic.
    return <p key={index} className="text-center text-lg my-1 italic leading-normal">{trimmedLine}</p>;
  }).filter(Boolean);

  return <>{content}</>;
};

export default CardContent;