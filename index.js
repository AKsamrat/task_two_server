const express = require('express');
const cors = require('cors');
// const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
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
    const userCollection = client.db('assetManagement').collection('users');
    const assetCollection = client.db('assetManagement').collection('assets');
    const paymentCollection = client
      .db('assetManagement')
      .collection('payments');
    const teamCollection = client.db('assetManagement').collection('teams');
    const teamsCollection = client.db('emaJohnDB').collection('products');
    const requestCollection = client
      .db('assetManagement')
      .collection('requests');
    const messageCollection = client
      .db('assetManagement')
      .collection('messages');

    //product collection api-----------------------

    //load all user
    app.get('/all-users', async (req, res) => {
      // console.log(req.headers);
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page);
      const filter = {
        role: 'employee',
      };
      const result = await userCollection
        .find(filter)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });
    //for pagination count

    //get my employee===============<<<<<<<<<<<<<<<<<<hr manager
    app.get('/my-employee/:email', async (req, res) => {
      const email = req.params.email;
      // console.log(req.headers);
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page);
      const query = { hrEmail: email };

      const result = await teamCollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });
    //get my team===============<<<<<<<<<<<<<<<<<<for employee
    app.get('/my-team/:email', async (req, res) => {
      const empEmail = req.params.email;
      const empQuery = { email: empEmail };
      const userData = await userCollection.findOne(empQuery);
      const hrData = userData?.hrData;
      const email = hrData?.hrEmail;
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page);
      const query = { hrEmail: email };

      const result = await teamCollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    //save user data in db hr and employee

    //profile update================
    app.patch('/profile-update/:email', async (req, res) => {
      const email = req.params.email;
      const updateData = req.body;
      const query = { email: email };
      const updateDoc = {
        $set: {
          name: updateData.name,
          updateDate: new Date(),
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //asset add api =========================>>>>
    app.post('/addAsset', async (req, res) => {
      const assetData = req.body;
      const pName = assetData.productName;
      const query = { productName: pName };
      const isExist = await assetCollection.findOne(query);
      if (isExist) return 'Product Already exist';
      const result = await assetCollection.insertOne(assetData);
      res.send(result);
    });

    //get all asset api==========<<<<<<<<<<<<<<<
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

    app.get('/requested-assets/:email', async (req, res) => {
      const email = req.params.email;
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page);
      const search = req.query.search;
      const filter = req.query.filter;
      const sort = req.query.sort;

      let query = {
        reqEmail: email,
      };
      if (search) {
        query = {
          assetName: { $regex: search, $options: 'i' },
        };
      }
      if (filter) query.assetType = filter;
      if (sort) query.reqStatus = sort;

      const result = await requestCollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    app.get('/empAll-request/:email', async (req, res) => {
      const email = req.params.email;
      const query = { reqEmail: email };

      let currentDate = new Date();
      let lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

      const result = await requestCollection
        .find({
          reqEmail: email,
          reqDate: {
            $gte: lastMonthDate.toISOString(),
            $lt: currentDate.toISOString(),
          },
        })
        .toArray();
      // const result = await requestCollection.find(query).aggregate().toArray();
      res.send(result);
    });

    //get all requested asset for Hr manager ======<<<<<<<<<<<<<<

    app.get(
      '/requestedAssets-hrManger/:email',

      async (req, res) => {
        const email = req.params.email;
        const size = parseInt(req.query.size);
        const page = parseInt(req.query.page);
        const search = req.query.search;

        let query = {
          posterEmail: email,
        };
        if (search) {
          query = { reqName: { $regex: search, $options: 'i' } };
        }

        const result = await requestCollection
          .find(query)
          .skip(page * size)
          .limit(size)
          .toArray();
        res.send(result);
      }
    );

    //update asset data
    app.put('/updateAsset/:id', async (req, res) => {
      const id = req.params.id;
      const assetData = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: assetData,
      };
      const result = await assetCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // message section========================........>>>>>>>>>>>>>

    //pagination asset----------------------

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
