
export interface Character {
  name: string;
  category: string;
  hints: string[];
  description: string;
  imageSearchQuery: string;
}

export interface GameState {
  currentCharacter: Character | null;
  revealedHints: number;
  score: number;
  isGameOver: boolean;
  hasWon: boolean;
  attempts: number;
  history: { name: string; won: boolean; score: number }[];
}

export enum GameStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}
