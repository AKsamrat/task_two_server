const express = require('express');
const cors = require('cors');
// const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://scic-task-two.netlify.app',
    'http://dragon-news-b9bf2.web.app',
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
// app.use(cookieParser());

// verify jwt middleware

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nj7eiar.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client.db('task_two').collection('product');

    //get all product api==========<<<<<<<<<<<<<<<
    app.get('/all-product', async (req, res) => {
      const email = req.params.email;
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page);
      const search = req.query.search;
      const filter = req.query.filter;
      const sort = req.query.sort;
      const availability = req.query.availability;
      const dateSort = req.query.dateSort;
      const range = req.query.range;
      let query = {
        // reqEmail: email,
      };
      if (search) {
        query = { product_name: { $regex: search, $options: 'i' } };
      }
      if (filter) query.brand = filter;
      if (availability) query.category = availability;
      console.log(range);
      let lowerValue = range - 100;
      if (range === '100') query.price = { $gte: 0, $lte: 100 };
      if (range === '200') query.price = { $gte: 101, $lte: 200 };
      if (range === '300') query.price = { $gte: 201, $lte: 300 };
      // if (range) {
      //   if (range === '100') {
      //     query = { price: { $gte: 0, $lte: 100 } };
      //   } else if (range === '200') {
      //     query = { price: { $gte: 101, $lte: 200 } };
      //   } else if (range === '300') {
      //     query = { price: { $gte: 201, $lte: 1000 } };
      //   }
      // }
      console.log(query);

      let option = {};
      let option1 = {};

      if (sort) {
        option = { price: sort === 'asc' ? 1 : -1 };
      }
      if (dateSort) {
        option = { added_time: dateSort === 'asc' ? 1 : -1 };
      }

      let currentDate = new Date();
      let lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

      const result = await productCollection
        .find(query)
        .sort(option)
        // price: sort === 'asc' ? 1 : -1,
        // added_time: dateSort === 'asc' ? 1 : -1,
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    //pagination product----------------------

    app.get('/assetsCount', async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });

    //mr manager payment check

    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello from product management Server....');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
