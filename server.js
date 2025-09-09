const express = require('express');  //import express.js framework import === require
const mongoose = require('mongoose'); //import moongose library
const cors = require('cors');         //import cors
require('dotenv').config();

const app = express();    //create a web server
app.use(cors());          //enabling cors  
app.use(express.json());  //parsing json data coming from frontend so that backend(nodejs) can access it

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {                 //mongodb connection
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Transaction schema
const transactionSchema = new mongoose.Schema({             //create a schema
  date: String,
  payee: String,
  category: String,
  amount: Number,
});

//converts schema to model,'Transaction' Converts to 'transactions' collection , 
// Transaction is a model object that let us to use powerful methods save,find,updateOne,...


const Transaction = mongoose.model('Transaction', transactionSchema);    
                                                                          
// Routes
app.get('/api/transactions', async (req,res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

app.post('/api/transactions', async (req, res) => {
  try {
    const txn = new Transaction(req.body);
    await txn.save();
    res.json(txn);
  } catch (err) {
    console.error('Error saving transaction:', err);
    res.status(500).json({ error: 'Failed to save transaction' });
  }
});

app.put('/api/transactions/:id', async (req,res) => {
try{
        const txnId = req.params.id;
        const updatedTxn = await Transaction.findByIdAndUpdate(txnId, req.body,{
        new : true,
        runValidators : true,
        });
        if (!updatedTxn) {
              return res.status(404).json({ error: 'Transaction not found' });
            }
            res.status(200).json(updatedTxn);

          }
       catch (err)
       {
            console.error('Error updating transaction:', err);
            res.status(500).json({ error: 'Failed to update transaction' });
          }
});



app.delete('/api/transactions/:id', async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
res.send(`deleted ID is ${req.params.id}`);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

