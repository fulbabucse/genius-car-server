const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// Username: geniusCar
// Password: 0xefAh63Y2NWnriw

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Genius Car server running");
});

const uri =
  "mongodb+srv://geniusCar:0xefAh63Y2NWnriw@cluster0.7ywptfp.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    const Products = client.db("geniusCar").collection("products");
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await Products.insertOne(product);
      console.log(result);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = Products.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err.name, err.message));

app.listen(port, (req, res) => {
  console.log("Genius Car server running on port: ", port);
});
