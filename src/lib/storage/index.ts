// Re-export all modules for backward compatibility
export { getDB, generateId, clearAllData } from './db'
export type { BudgetManagerDB } from './db'

// Expense Categories
export {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} from './expense-categories'

// Salary Categories
export {
  getAllSalaryCategories,
  getSalaryCategoryById,
  addSalaryCategory,
  updateSalaryCategory,
  deleteSalaryCategory,
} from './salary-categories'

// Invoices
export {
  getInvoicesByMonth,
  getInvoiceById,
  getInvoicesByType,
  addInvoice,
  updateInvoice,
  deleteInvoice,
} from './invoices'

// Month Budgets
export {
  getMonthBudget,
  setMonthBudget,
} from './budgets'

// User & Wallets
export {
  getUser,
  saveUser,
  getCurrency,
  setCurrency,
  getAllWallets,
  getWalletById,
  addWallet,
  updateWallet,
  deleteWallet,
} from './user'

// Todos
export {
  getAllTodoCategories,
  getTodoCategoryById,
  addTodoCategory,
  updateTodoCategory,
  deleteTodoCategory,
  getTasksByCategoryAndDate,
  getTasksByDate,
  addTodoTask,
  updateTodoTask,
  deleteTodoTask,
  reorderTodoTasks,
} from './todos'

// Notes
export {
  getAllNotes,
  getNoteById,
  addNote,
  updateNote,
  deleteNote,
} from './notes'
