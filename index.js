const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware 
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://ARTIFY_DB:mLpclWTRK99TzcIv@cluster0.2ss8g4p.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

async function run() {
  try {
    await client.connect();
    const db = client.db("ARTIFY_DB");
    const modelCollection = db.collection("Artworks");
    const favoriteCollecton = db.collection("favorite");


    app.get("/latest-artworks", async (req, res) => {
      const result = await modelCollection.find({ visibility: true }).sort({ createdAt: -1 }).limit(6).toArray();
      res.send({
        success: true,
        result,
      });
    });
    app.get('/all-artworks', async (req, res) => {
      const result = await modelCollection.find().toArray()
      res.send({
        success: true,
        result,
      });
    })
    app.post('/add-artworks', async (req, res) => {
      const artWorks = req.body;
      // console.log(artWorks)
      const result = await modelCollection.insertOne(artWorks);
      res.send({
        success: true,
        result
      })

    })
    app.get('/art-details/:id', async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const result = await modelCollection.findOne({ _id: new ObjectId(id) });
      const query = { artistEmail: result.artistEmail }
      const allArtByArtist = await modelCollection.find(query).toArray();
      res.send({
        success: true,
        result,
        allArtByArtist,
      });
    })
    app.put('/art-details/:id/like', async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) }
      const result = await modelCollection.updateOne(
        query,
        { $inc: { likes: 1 } })
      res.send({
        success: true,
        result
      })
    })
    app.post('/fevorites', async (req, res) => {
      const favorite = req.body;
      console.log(favorite)
      const result = await favoriteCollecton.insertOne(favorite);
      res.send({
        success: true,
        result
      })
    })
    app.get('/favorites-list', async (req, res) => {
      const { email } = req.query;
      const query = { userEmail: email };
      const result = await favoriteCollecton.find(query).toArray();
      res.send({
        success: true,
        result
      })
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Successfully connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}


run().catch(err => console.error(err)); // Make sure to call the function

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
