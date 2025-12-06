import { Category, LedgerAccount } from "../types";

export const ACCOUNTS: LedgerAccount[] = [
  // Assets (CA)
  { name: "Bank", category: Category.SFP_CA },
  { name: "Cash", category: Category.SFP_CA },
  { name: "Cash at bank", category: Category.SFP_CA },
  { name: "Fixed deposit (6-month)", category: Category.SFP_CA, excludeFromForm3: true },
  { name: "Trade receivables", category: Category.SFP_CA },
  { name: "Loan to Mr Chan (repayable in September 2026)", category: Category.SFP_CA},
  
  // Assets (NCA)
  { name: "Equipment", category: Category.SFP_NCA },
  { name: "Furniture", category: Category.SFP_NCA },
  { name: "Office furniture", category: Category.SFP_NCA },
  { name: "Furniture and fixtures", category: Category.SFP_NCA },
  { name: "Machinery", category: Category.SFP_NCA },
  { name: "Motor cars", category: Category.SFP_NCA },
  { name: "Motor vans", category: Category.SFP_NCA },
  { name: "Motor vehicles", category: Category.SFP_NCA },
  { name: "Office equipment", category: Category.SFP_NCA },
  { name: "Premises", category: Category.SFP_NCA },
  { name: "Loan to Gary (repayable in January 2029)", category: Category.SFP_NCA},
  { name: "Rental deposit (refundable in 9 months)", category: Category.SFP_CA, excludeFromForm3: true }, // Convention choice: CA

  // Liabilities (CL)
  { name: "Bank overdraft", category: Category.SFP_CL, excludeFromForm3: true },
  { name: "Other payables", category: Category.SFP_CL },
  { name: "Short term loans", category: Category.SFP_CL, excludeFromForm3: true },
  { name: "Trade payables", category: Category.SFP_CL },
  { name: "Loan from Gary Chan (repayable in December 2026)", category: Category.SFP_CL},

  // Liabilities (NCL)
  { name: "Bank loan [no repayment date given]", category: Category.SFP_NCL },
  { name: "Loan from Gary (repayable in March 2028)", category: Category.SFP_NCL },

  // Capital
  { name: "Capital", category: Category.SFP_CAPITAL },
  { name: "Drawings", category: Category.SFP_CAPITAL },

  // Revenue (Sales)
  { name: "Sales", category: Category.IS_SALES },
  { name: "Returns inwards", category: Category.IS_SALES },

  // COGS
  { name: "Purchases", category: Category.IS_COGS },
  { name: "Carriage inwards", category: Category.IS_COGS, excludeFromForm3: true  },
  { name: "Returns outwards", category: Category.IS_COGS },

  // Other Revenue
  { name: "Agency commission revenue", category: Category.IS_OTHER_REV },
  { name: "Commission income", category: Category.IS_OTHER_REV },
  { name: "Interest income", category: Category.IS_OTHER_REV },
  { name: "Rental income", category: Category.IS_OTHER_REV },
  { name: "Discounts received", category: Category.IS_OTHER_REV, excludeFromForm3: true  },

  // Expenses
  { name: "Administrative expenses", category: Category.IS_EXPENSES },
  { name: "Agent salaries", category: Category.IS_EXPENSES },
  { name: "Bank charges", category: Category.IS_EXPENSES, excludeFromForm3: true  },
  { name: "Carriage outwards", category: Category.IS_EXPENSES, excludeFromForm3: true  },
  { name: "Discounts allowed", category: Category.IS_EXPENSES, excludeFromForm3: true  },
  { name: "Electricity", category: Category.IS_EXPENSES },
  { name: "Rent", category: Category.IS_EXPENSES },
  { name: "Rent and rates", category: Category.IS_EXPENSES },
  { name: "Salaries", category: Category.IS_EXPENSES },
  { name: "Wages", category: Category.IS_EXPENSES },
  { name: "Wages and salaries", category: Category.IS_EXPENSES },
  { name: "Selling expenses", category: Category.IS_EXPENSES },
  { name: "Sundry expenses", category: Category.IS_EXPENSES },
];

// Helper to shuffle array
export const shuffleAccounts = (sourceArray: LedgerAccount[] = ACCOUNTS): LedgerAccount[] => {
  const array = [...sourceArray];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};