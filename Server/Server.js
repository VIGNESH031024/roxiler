const express=require('express');
const mongoose=require('mongoose');
const cors = require('cors');

const app=express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://Vignesh:031024@cluster0.u8wreao.mongodb.net/Roxiler?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>console.log("Mongodb conected")) 



const Transaction=require('./Models/Transaction');

app.get('/initialize', async (req, res) => {
    try {
      const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      const transactions = await response.json();
  
      const bulkOps = transactions.map(transaction => ({
        updateOne: {
          filter: { id: transaction.id },
          update: transaction,
          upsert: true
        }
      }));
  
      try {
        await Transaction.bulkWrite(bulkOps);
        res.send('Database initialized with seed data');
      } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).send('Error initializing database');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
    }

  });app.get('/transactions', async (req, res) => {
    try {
      const transactions = await Transaction.find().exec();
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).send('Error fetching transactions');
    }
  });


const PORT = 2000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));