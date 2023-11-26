const express = require("express");
const bodyParser = require("body-parser");

const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const dbName = "./baby-formula.db";

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

app.post("/add", (req, res, next) => {
  const db = new sqlite3.Database(dbName);
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS babyformula([id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,[recorded] NVARCHAR(10), [timeAndMinutes] NVARCHAR(5), [taken] INT, [other] NVARCHAR(200))"
    );

    const d = new Date(req.body.recorded);
    const recorded = req.body.recorded;
    const timeAndMinutes = req.body.timeAndMinutes;
    const taken = req.body.taken;
    const other = req.body.other;
    const sql = `INSERT INTO babyformula (recorded,timeAndMinutes, taken, other) VALUES  ('${recorded}', '${timeAndMinutes}',${taken},'${other}')`;
    db.run(sql);
    res.status(200).send({ text: "Added" });
  });
});

app.get("/get-data-by-date/:date", (req, res, next) => {
  const db = new sqlite3.Database(dbName);
  db.serialize(() => {
    const data = [];
    const sql = `select * from babyformula where recorded="${req.params.date}"`;
    db.each(
      sql,
      function (err, row) {
        if (err) {
          res.send("Error encountered while displaying");
          return console.error(err.message);
        }
        data.push(row);
      },
      function (err, counter) {
        res.status(200).send(data);
      }
    );
  });
});

app.get("/history", (req, res, next) => {
  const db = new sqlite3.Database(dbName);
  db.serialize(() => {
    const data = [];
    const sql = `select * from babyformula;`;
    db.each(
      sql,
      function (err, row) {
        if (err) {
          res.send("Error encountered while displaying");
          return console.error(err.message);
        }
        data.push(row);
      },
      function (err, counter) {
        res.status(200).send(data);
      }
    );
  });
});

app.get("/getById/:id", (req, res, next) => {
  const db = new sqlite3.Database(dbName);
  db.serialize(() => {
    db.each(
      "SELECT * FROM babyformula WHERE id =?",
      [req.params.id],
      function (err, row) {
        if (err) {
          res.send("Error encountered while displaying");
          return console.error(err.message);
        }
        res.status(200).send(row);
        console.log("Entry displayed successfully");
      }
    );
  });
});

app.delete("/delete/:id", (req, res, next) => {
  const db = new sqlite3.Database(dbName);
  db.serialize(() => {
    const data = [];
    const sql = `delete from babyformula where id=${req.params.id};`;
    db.run(sql, function (err) {
      if (err) {
        res.status(400).send({ text: "Error encountered while displaying" });
        return console.error(err.message);
      }
      res.status(200).send({ text: "Data deleted!" });
    });
  });
});

app.put("/fetchById", (req, res, next) => {
  const db = new sqlite3.Database(dbName);
  db.serialize(() => {
    const sql = `update babyformula set recorded="${req.body.recorded}", timeAndMinutes="${req.body.timeAndMinutes}", taken=${req.body.taken}, other="${req.body.other}" where id=${req.body.id};`;
    console.log(sql);
    db.run(sql, function (err) {
      if (err) {
        res.status(400).send({ text: "Error encountered while displaying" });
        return console.error(err.message);
      }
      res.status(200).send({ text: "Data edited!" });
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
