const express = require("express");
const bodyParser = require("body-parser");

const fs = require("fs");
const moment = require("moment-timezone");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

moment.tz("Hungary/Budapest").format();

const dbName = "./baby-formula.db";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.post("/add", (req, res, next) => {
  const db = new sqlite3.Database(dbName);
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS babyformula([id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,[recorded] NVARCHAR(120), [timeAndMinutes] NVARCHAR(5), [taken] INT, [other] NVARCHAR(200))"
    );

    const recorded = moment(new Date(req.body.recorded)).format(
      "YYYY-MM-DD HH:mm"
    );
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
    const sql = `select * from babyformula where recorded between "${req.params.date} 00:00" and "${req.params.date} 23:59"`;
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
