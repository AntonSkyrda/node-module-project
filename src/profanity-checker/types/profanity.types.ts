export type SwearifyLanguage = 'uk' | 'ru' | 'en';

export interface SwearifyResult {
  found: boolean;
  bad_words?: string[];
  filtered_sentense?: string;
  selected_languages?: string[];
}

export interface SwearifyApi {
  findAndFilter(
    text: string,
    replaceChar?: string,
    languages?: SwearifyLanguage[],
    allowedWords?: string[],
    extraBlocked?: string[],
  ): SwearifyResult;
}
