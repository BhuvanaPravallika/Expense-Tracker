import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    payee: '',
    category: '',
    amount: '',
  });
  const [errors, setErrors] = useState({});
  const [editTransactionId, setEditTransactionId] = useState(null);

  //once the page render loads all transactions from backend
  useEffect(() => {
    axios.get('http://localhost:4000/api/transactions')
      .then(res => setTransactions(res.data))                                    
      .catch(err => console.error('Error fetching transactions:', err));
  }, []);

  //if any input is changed then it will update new value
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({ ...newTransaction, [name]: value });  //changes specific input field
    setErrors({ ...errors, [name]: '' });         //if any field found empty then related error will be displayed
  };

  //calculate total balance from transactions
  const calculateBalance = () => {
    return transactions.reduce((acc, txn) => acc + txn.amount, 0);
  };

  
  const handleAddOrUpdate = () => {
    const { date, payee, category, amount } = newTransaction;
    const newErrors = {};

    if (!date) newErrors.date = 'Date is required';
    if (!payee.trim()) newErrors.payee = 'Payee is required';
    if (!category.trim()) newErrors.category = 'Category is required';
    if (!amount.trim()) newErrors.amount = 'Amount is required';
    else if (isNaN(parseFloat(amount))) newErrors.amount = 'Amount must be a number';

    const parsedAmount = parseFloat(amount);
    const currentBalance = calculateBalance();

    if (parsedAmount < 0 && Math.abs(parsedAmount) > currentBalance && !editTransactionId) {
      newErrors.amount = 'Balance is too low for this transaction';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const request = editTransactionId
      ? axios.put(`http://localhost:4000/api/transactions/${editTransactionId}`, {
          date,
          payee,
          category,
          amount: parsedAmount
        })
      : axios.post('http://localhost:4000/api/transactions', {
          date,
          payee,
          category,
          amount: parsedAmount
        });

    request
      .then(res => {
        const updatedList = editTransactionId
          ? transactions.map(txn => txn._id === editTransactionId ? res.data : txn)
          : [...transactions, res.data];

        setTransactions(updatedList);
        resetForm();
      })
      .catch(err => console.error('Error saving transaction:', err));
  };

  const resetForm = () => {
    setNewTransaction({ date: '', payee: '', category: '', amount: '' });
    setErrors({});
    setEditTransactionId(null);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:4000/api/transactions/${id}`)
      .then(() => {
        setTransactions(transactions.filter(txn => txn._id !== id));
      })
      .catch(err => console.error('Error deleting transaction:', err));
  };

  const handleEdit = (txn) => {
    setEditTransactionId(txn._id);
    setNewTransaction({
      date: txn.date,
      payee: txn.payee,
      category: txn.category,
      amount: txn.amount.toString(),
    });
  };

  return (
    <div className="container">
      <h2>💰 Personal Finance Dashboard</h2>

      <div className="form-section">
        <div className="form">
          <div className="form-row">
            <div className="input-group">
              <input
                type="date"
                name="date"
                value={newTransaction.date}
                onChange={handleChange}
              />
              {errors.date && <p className="error-message">{errors.date}</p>}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="payee"
                placeholder="Payee"
                value={newTransaction.payee}
                onChange={handleChange}
              />
              {errors.payee && <p className="error-message">{errors.payee}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={newTransaction.category}
                onChange={handleChange}
              />
              {errors.category && <p className="error-message">{errors.category}</p>}
            </div>
            <div className="input-group">
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={newTransaction.amount}
                onChange={handleChange}
              />
              {errors.amount && <p className="error-message">{errors.amount}</p>}
            </div>
          </div>

          {editTransactionId ? (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleAddOrUpdate} className="update-button">
                Update Transaction
              </button>
              <button onClick={resetForm} className="cancel-button">
                Cancel Edit
              </button>
            </div>
          ) : (
            <button onClick={handleAddOrUpdate} className="add-button">
              Add Transaction
            </button>
          )}
        </div>

        <div className="balance-box">
          <h3>Balance</h3>
          <p className="balance">₹{calculateBalance()}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Payee</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn._id}>
              <td>{txn.date}</td>
              <td>{txn.payee}</td>
              <td>{txn.category}</td>
              <td style={{ color: txn.amount < 0 ? 'red' : 'green' }}>
                ₹{txn.amount}
              </td>
              <td>
               
                <button
                  onClick={() => handleEdit(txn)}
                  className="edit-button"  style={{ marginRight: '25px' }}
                >
                  Edit
                </button>

                 <button
                  onClick={() => handleDelete(txn._id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
