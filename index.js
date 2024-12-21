require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4jm04.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    // await client.db("admin").command({ ping: 1 });

    const newVisaCollections = client.db('visa').collection('visa-collection');  
    const appliedVisa = client.db('visa').collection('applied-visa');  

    // Get all visa data
    app.get('/add-visa', async (req, res) => {
      const result = await newVisaCollections.find({}).sort({ createdAt: -1 }).toArray();
      res.send(result);
    });

    // Post new visa data
    app.post('/add-visa', async (req, res) => {
      const data = req.body;
      data.createdAt = new Date(); 
      const result = await newVisaCollections.insertOne(data);
      res.send(result);
    });

    // Get specific visa data by ID
    app.get('/add-visa/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newVisaCollections.findOne(query);
      res.send(result);
    });

    // Get all applied visa data
    app.get('/applied-visa', async (req, res) => {
      const result = await appliedVisa.find().toArray();
      res.send(result);
    });

    // Post applied visa data for a single user
    app.post('/visa', async (req, res) => {
      const data = req.body;
      const result = await appliedVisa.insertOne(data);
      res.send(result);
    });

    // Get applied visa data based on userEmail
    app.get("/visa-user", async (req, res) => {
      const email = req.query?.userEmail;
      const applications = await appliedVisa.find({ userEmail: email }).sort({ _id: -1 }).toArray();
      
      res.send(applications);
    });

    // Get add visa data based on userEmail
    app.get("/added-visa-user", async (req, res) => {
      const email = req.query?.userEmail;
      const applications = await newVisaCollections.find({ userEmail: email }).sort({ _id: -1 }).toArray();
      
      res.send(applications);
    });

        // to delete id
    app.get('/applied-visa/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await appliedVisa.findOne(query);
        res.send(result);
      })

      // for delete my visa applications

    app.delete('/applied-visa/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appliedVisa.deleteOne(query);
      res.send(result);
    })

    // to delete added visa by users 
    app.delete('/add-visa/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newVisaCollections.deleteOne(query);
      res.send(result);
    })

    // to update added visa by users
    app.patch('/add-visa/:id', async (req, res) => {
      const visaId = req.params.id; 
      const updateVisa = req.body; 
      const filter = { _id: new ObjectId(visaId) };
      const options = { upsert: true }; 
  
      const newUpdateVisa = {
          $set: {
              countryImage: updateVisa.countryImage,
              countryName: updateVisa.countryName,
              visaType: updateVisa.visaType,
              formatHour: updateVisa.formatHour,
              requiredDocuments: updateVisa.requiredDocuments,
              ageRestriction: updateVisa.ageRestriction,
              description: updateVisa.description,
              fee: updateVisa.fee,
              validity: updateVisa.validity,
              applicationMethod: updateVisa.applicationMethod,
              userEmail: updateVisa.userEmail,
          }
      };
          const result = await newVisaCollections.updateOne(filter, newUpdateVisa, options);
          res.send(result);
  });
  
     // for searching data
     app.get("/search", async (req, res) => {
      const { searchParams } = req.query;

      let option = {};

      if (searchParams) {
        option = { countryName: { $regex: searchParams, $options: "i" } };
      }
      const result = await appliedVisa.find(option).toArray();
      res.send(result);
    });


    // Default route
    app.get('/', (req, res) => {
      res.send('Welcome to VisaEase');
    });

  } finally {
    // Cleanup if necessary
  }
}

run().catch(console.dir);

app.listen(port, () => {
});

