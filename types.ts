export enum Category {
  IS_SALES = "Sales",
  IS_COGS = "Cost of goods sold",
  IS_OTHER_REV = "Other revenue",
  IS_EXPENSES = "Expenses",
  SFP_NCA = "Non-current assets",
  SFP_CA = "Current assets",
  SFP_CAPITAL = "Capital",
  SFP_NCL = "Non-current liabilities",
  SFP_CL = "Current liabilities",
}

export interface LedgerAccount {
  name: string;
  category: Category;
  hint?: string;
  excludeFromForm3?: boolean;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  streak: number;
  history: AnswerHistory[];
  isFinished: boolean;
}

export interface AnswerHistory {
  account: LedgerAccount;
  userSelected: Category;
  isCorrect: boolean;
  timestamp: number;
}