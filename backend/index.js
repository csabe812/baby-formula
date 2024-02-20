const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, Model, DataTypes } = require("sequelize");

const app = express();
const port = 3000;

app.use("/", express.static(path.join(__dirname, "frontend-build", "browser")));

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./baby-formula.db",
});

// Define Babyformula model
class Babyformula extends Model {}
Babyformula.init(
  {
    recorded: DataTypes.STRING,
    hourAndMinutes: DataTypes.STRING,
    taken: DataTypes.INTEGER,
    eaten: DataTypes.INTEGER,
    other: DataTypes.STRING,
  },
  { sequelize, modelName: "babyformula" }
);

// Define Comment model
class Comment extends Model {}
Comment.init(
  {
    recorded: DataTypes.STRING,
    content: DataTypes.STRING,
  },
  { sequelize, modelName: "comment" }
);

// Sync models with database
sequelize.sync();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
});

app.get("/babyformula", async (req, res) => {
  const babyformula = await Babyformula.findAll();
  res.json(babyformula);
});

app.get("/babyformula/:id", async (req, res) => {
  const babyformula = await Babyformula.findByPk(req.params.id);
  res.json(babyformula);
});

app.post("/babyformula", async (req, res) => {
  const babyformula = await Babyformula.create(req.body);
  res.json(babyformula);
});

app.put("/babyformula/:id", async (req, res) => {
  const babyformula = await Babyformula.findByPk(req.params.id);
  if (babyformula) {
    await babyformula.update(req.body);
    res.json(babyformula);
  } else {
    res.status(404).json({ message: "Babyformula not found" });
  }
});

app.delete("/babyformula/:id", async (req, res) => {
  const babyformula = await Babyformula.findByPk(req.params.id);
  if (babyformula) {
    await babyformula.destroy();
    res.json({ message: "Babyformula deleted" });
  } else {
    res.status(404).json({ message: "Babyformula not found" });
  }
});

app.get("/babyformula/recorded/:recorded", async (req, res) => {
  const babyformula = await Babyformula.findAll({
    where: { recorded: req.params.recorded },
  });
  res.json(babyformula);
});

app.get("/comment", async (req, res) => {
  const comment = await Comment.findAll();
  res.json(comment);
});

app.get("/comment/:id", async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  res.json(comment);
});

app.post("/comment", async (req, res) => {
  const comment = await Comment.create(req.body);
  res.json(comment);
});

app.put("/comment/:id", async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (comment) {
    await comment.update(req.body);
    res.json(comment);
  } else {
    res.status(404).json({ message: "Comment not found" });
  }
});

app.delete("/comment/:id", async (req, res) => {
  const comment = await Comment.findByPk(req.params.id);
  if (comment) {
    await comment.destroy();
    res.json({ message: "Comment deleted" });
  } else {
    res.status(404).json({ message: "Comment not found" });
  }
});

app.get("/comment/recorded/:recorded", async (req, res) => {
  const comment = await Comment.findAll({
    where: { recorded: req.params.recorded },
  });
  res.json(comment);
});

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "frontend-build", "browser", "index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
