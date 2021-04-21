const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const ObjectId = require("mongodb").ObjectId;
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();
// console.log(process.env.DB_USER);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ongm4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const port = process.env.PORT || 8000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("customerImage"));
app.use(fileUpload());



// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });




const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const orderInfoCollection = client.db("gerezdb").collection("orderInformation");
  const reviewInformationCollection = client
    .db("gerezdb")
    .collection("reviewInformation");
    const servicesDataCollection = client
      .db("gerezdb")
      .collection("servicesData");
  console.log("mongo connected");
  // order
  app.post("/addOrder", (req, res) => {
    const order = req.body;
    orderInfoCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/orders", (req, res) => {
    orderInfoCollection.find()
    .toArray((err, items) => {
      console.log(items);
      res.send(items);
    });
  })

  // add review
  app.post("/addReview", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const companyName = req.body.companyName;
    const customerOpinion = req.body.customerOpinion;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    reviewInformationCollection
      .insertOne({ name, companyName, image, customerOpinion })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/reviews", (req, res) => {
    reviewInformationCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // add service
  app.post("/addService", (req, res) => {
    const file = req.files.file;
    const serviceName = req.body.serviceName;
    const description = req.body.description;
    const price = req.body.price;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    servicesDataCollection
      .insertOne({ serviceName, description, image, price })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/services", (req, res) => {
    servicesDataCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.post("/singleService", (req, res) => {
    const id = req.body.id;
    servicesDataCollection.find({ _id: ObjectId(id)}).toArray((err, documents) => {
      res.send(documents);
    });
  });
});


app.listen(port);
