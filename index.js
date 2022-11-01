const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const Services = client.db("geniusCar").collection("services");

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await Services.insertOne(service);
      console.log(result);
      res.send(result);
    });

    // Products Server
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await Products.insertOne(product);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = Products.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Products.findOne(query);
      res.send(result);
    });

    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatesInfo = {
        $set: {
          name: product.name,
          image: product.image,
          price: product.price,
          serviceType: product.serviceType,
          descriptions: product.descriptions,
        },
      };
      const result = await Products.updateOne(query, updatesInfo, options);
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Products.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err.name, err.message));

app.listen(port, (req, res) => {
  console.log("Genius Car server running on port: ", port);
});
