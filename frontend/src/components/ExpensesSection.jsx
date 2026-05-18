import { useState } from 'react';
import { EXPENSE_CATEGORIES } from '../models/index.js';
import { validatePositiveNumber } from '../utils/validation.js';

export default function ExpensesSection({ expenses = [], onAdd, onUpdate, onRemove, onValidationError }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [spentOn, setSpentOn] = useState('');
  const [editing, setEditing] = useState(null);

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
      spentOn: spentOn || null,
    });
    setAmount('');
    setDescription('');
    setCategory('General');
    setSpentOn('');
  };

  const updateEditing = (field, value) => setEditing((current) => ({ ...current, [field]: value }));

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;

    const error = validatePositiveNumber(editing.amount, 'Expense amount');
    if (error) {
      onValidationError(error);
      return;
    }

    await onUpdate(editing.id, {
      amount: Number(editing.amount),
      description: editing.description,
      category: editing.category,
      spentOn: editing.spentOn || null,
    });
    setEditing(null);
  };

  return (
    <div className="surface">
      <h2 className="section-title">
        <span aria-hidden>💰</span> Expenses
      </h2>
      <form className="mb-6 grid gap-4 sm:grid-cols-4" onSubmit={submit}>
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
        <div>
          <label className="field-label">Date</label>
          <input className="field" type="date" value={spentOn} onChange={(e) => setSpentOn(e.target.value)} />
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
          <li key={expense.id} className="py-3 first:pt-0">
            {editing?.id === expense.id ? (
              <form className="grid gap-2 rounded-lg border border-teal-200 bg-white p-3 sm:grid-cols-4" onSubmit={saveEdit}>
                <input className="field" type="number" min="0.01" step="0.01" value={editing.amount} onChange={(e) => updateEditing('amount', e.target.value)} required />
                <select className="field" value={editing.category} onChange={(e) => updateEditing('category', e.target.value)}>
                  {EXPENSE_CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input className="field" type="date" value={editing.spentOn} onChange={(e) => updateEditing('spentOn', e.target.value)} />
                <input className="field sm:col-span-4" value={editing.description} onChange={(e) => updateEditing('description', e.target.value)} required maxLength={200} />
                <div className="flex gap-2 sm:col-span-4">
                  <button type="submit" className="btn-primary !py-2">
                    Save
                  </button>
                  <button type="button" className="btn-secondary !py-2" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-800">
                  <span className="mr-2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {expense.category || 'General'}
                  </span>
                  {expense.description}{' '}
                  {expense.spentOn && <span className="text-xs text-slate-500">({new Date(expense.spentOn).toLocaleDateString()}) </span>}
                  <span className="font-semibold text-teal-800">{Number(expense.amount).toFixed(2)}</span>
                </span>
                <div className="flex shrink-0 gap-1">
                  {onUpdate && (
                    <button
                      type="button"
                      className="btn-ghost text-teal-800"
                      onClick={() =>
                        setEditing({
                          id: expense.id,
                          amount: String(expense.amount),
                          description: expense.description || '',
                          category: expense.category || 'General',
                          spentOn: expense.spentOn?.slice(0, 10) || '',
                        })
                      }
                    >
                      Edit
                    </button>
                  )}
                  <button type="button" className="btn-ghost text-rose-700 hover:bg-rose-50" onClick={() => onRemove(expense.id)}>
                    Remove
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
