const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SK);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Genius Car server running");
});

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.GENIUS_CAR_USER}:${process.env.GENIUS_CAR_PASSWORD}@cluster0.7ywptfp.mongodb.net/?retryWrites=true&w=majority`;
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
    const Users = client.db("geniusCar").collection("users");
    const Payments = client.db("geniusCar").collection("payments");

    app.post("/create-payment-intent", async (req, res) => {
      const order = req.body;
      const amount = order.totalPrice * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const paymentInfo = req.body;
      const payment = await Payments.insertOne(paymentInfo);
      res.send(payment);
    });

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    app.get("/users", verifyJWT, async (req, res) => {
      const query = {};
      const users = await Users.find(query).toArray();
      res.send(users);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await Users.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const options = { upsert: true };
      const updateUser = {
        $set: user,
      };
      const result = await Users.updateOne(user, updateUser, options);
      res.send(result);
    });

    app.put("/users/admin/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await Users.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "Forbidden access" });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedInfo = {
        $set: {
          role: "admin",
        },
      };
      const updated = await Users.updateOne(filter, updatedInfo, options);
      res.send(updated);
    });

    app.put("/users/removeAdmin/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await Users.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "Forbidden access" });
      }

      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedInfo = {
        $unset: {
          role: "admin",
        },
      };
      const updated = await Users.updateOne(filter, updatedInfo, options);
      res.send(updated);
    });

    /*
    ------------------------
        Service Database
    ------------------------
    */

    // Create Services
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await Services.insertOne(service);
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

    app.post("/orders", verifyJWT, async (req, res) => {
      const order = req.body;
      const result = await Orders.insertOne(order);
      res.send(result);
    });

    app.get("/orders", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "Forbidden access" });
      }

      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = Orders.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/orders/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Orders.findOne(query);
      res.send(result);
    });

    app.delete("/orders/:id", verifyJWT, async (req, res) => {
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
