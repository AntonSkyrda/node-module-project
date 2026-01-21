import { Injectable } from '@nestjs/common';
import swearifyImport from 'swearify';
import { SwearifyApi, SwearifyLanguage } from './types/profanity.types';

@Injectable()
export class ProfanityCheckerService {
  private readonly filter: SwearifyApi =
    swearifyImport as unknown as SwearifyApi;

  private readonly languages: SwearifyLanguage[] = ['uk', 'ru', 'en'];

  private readonly allowedWords: string[] = ['passat'];
  private readonly extraBlocked: string[] = [];
  private readonly replaceChar = '*';

  check(text: string): { ok: boolean; matches: string[] } {
    const input = String(text ?? '').toLowerCase();

    const res = this.filter.findAndFilter(
      input,
      this.replaceChar,
      this.languages,
      this.allowedWords,
      this.extraBlocked,
    );

    const rawMatches = (res.bad_words ?? [])
      .map((w) => String(w).trim().toLowerCase())
      .filter(Boolean);

    const uniq = [...new Set(rawMatches)];

    const matches = uniq.filter((bad) => this.isWholeWordMatch(input, bad));

    return {
      ok: matches.length === 0,
      matches,
    };
  }

  checkFields(...parts: Array<string | null | undefined>) {
    return this.check(parts.filter(Boolean).join('\n'));
  }

  private isWholeWordMatch(text: string, bad: string): boolean {
    const escaped = bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const re = new RegExp(
      `(^|[^\\p{L}\\p{N}_])${escaped}([^\\p{L}\\p{N}_]|$)`,
      'iu',
    );

    return re.test(text);
  }
}
