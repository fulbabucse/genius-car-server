const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Genius Car server running");
});

const uri = `mongodb+srv://${process.env.GENIUSCARUSER}:${process.env.GENIUSCARPASSWORD}@cluster0.7ywptfp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    const Products = client.db("geniusCar").collection("products"); // Products Collection
    const Services = client.db("geniusCar").collection("services"); // Services Collection
    const Orders = client.db("geniusCar").collection("orders");

    /*
    ------------------------
        Service Database
    ------------------------
    */

    // Create Services
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await Services.insertOne(service);
      console.log(result);
      res.send(result);
    });

    // Get All Service
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = Services.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get Single Service
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Services.findOne(query);
      res.send(result);
      console.log(result);
    });

    // Update Single Service
    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const service = req.body;
      const query = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateInfo = {
        $set: {
          name: service.name,
          price: service.price,
          image: service.image,
          serviceId: service.serviceId,
          descriptions: service.descriptions,
        },
      };
      const result = await Services.updateOne(query, updateInfo, option);
      res.send(result);
    });

    // Delete Single Service
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Services.deleteOne(query);
      res.send(result);
      console.log(result);
    });

    /*
    ------------------------
        Products Database
    ------------------------
    */

    // Create Products
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await Products.insertOne(product);
      res.send(result);
    });

    // Get All Products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = Products.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get Single Product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Products.findOne(query);
      res.send(result);
    });

    // Update Products
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

    // Delete Single Product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Products.deleteOne(query);
      res.send(result);
    });

    /*
    ------------------------
        Orders Database
    ------------------------
    */

    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await Orders.insertOne(order);
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = Orders.find(query);
      const result = await cursor.toArray();
      res.send(result);
      console.log(req.query.email);
    });

    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Orders.findOne(query);
      res.send(result);
    });

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Orders.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err.name, err.message));

app.listen(port, (req, res) => {
  console.log("Genius Car server running on port: ", port);
});
