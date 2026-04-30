import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../models/index.js';
import { validatePositiveNumber } from '../utils/validation.js';

export default function ExpensesSection({ expenses = [], onAdd, onRemove, onValidationError }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');

  const submit = async (e) => {
    e.preventDefault();
    const error = validatePositiveNumber(amount, 'Expense amount');
    if (error) {
      onValidationError(error);
      return;
    }

    await onAdd({
      amount: Number(amount),
      description,
      category,
      spentOn: null,
    });
    setAmount('');
    setDescription('');
    setCategory('General');
  };

  return (
    <div className="surface">
      <h2 className="section-title">
        <span aria-hidden>💰</span> Expenses
      </h2>
      <form className="mb-6 grid gap-4 sm:grid-cols-3" onSubmit={submit}>
        <div>
          <label className="field-label">Amount</label>
          <input className="field" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="field-label">Category</label>
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
            {EXPENSE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className="field-label">Description</label>
          <input className="field" value={description} onChange={(e) => setDescription(e.target.value)} required maxLength={200} />
        </div>
        <div className="sm:col-span-3">
          <button type="submit" className="btn-primary">
            Add expense
          </button>
        </div>
      </form>

      {expenses.length === 0 && <p className="text-sm text-slate-500">No expenses yet.</p>}
      <ul className="divide-y divide-slate-100">
        {expenses.map((expense) => (
          <li key={expense.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
            <span className="text-slate-800">
              <span className="mr-2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {expense.category || 'General'}
              </span>
              {expense.description} <span className="font-semibold text-teal-800">{Number(expense.amount).toFixed(2)}</span>
            </span>
            <button type="button" className="btn-ghost text-rose-700 hover:bg-rose-50" onClick={() => onRemove(expense.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
