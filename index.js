const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const ids = {
  Darren: 1,
  Dominic: 0,
  Zion: 7,
  Fabrice: 4,
  Solomon: 2,
  Connor: 6,  
  London: 3,
  Ifeanyichukwu: 5
};

function get_id(list) {
  for (let i = 0; i < list.length; i++) {
    ids[list[i].name] = i;
  }
}
const lvls = {
  s1: 100,
  s2: 200,
  s3: 300,
};
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://trvlert:RrhE5a553UMc0LIC@turncraft.4bigr.mongodb.net/vdlg`;
let points = {"data": {}};
let collection;
async function getDocs() {
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = client.db('vdlg');
   collection = db.collection("users");
    // Find the first document (empty query matches all documents, limit 1 fetches only the first)
    const document = await collection.find({}).limit(10).toArray();
    points.data = document;
  } catch (error) {
    console.error(error);
  }
}


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class PointSystem {
  constructor(initialPoints = 0) {
    this.points = initialPoints;
    this.lvls = {
      s1: 100,
      s2: 200,
      s3: 300,
    };
  }

   async addPoints(pointsToAdd, to) {
    await collection.updateOne({"name": to}, {$inc: {points: pointsToAdd}});
    getDocs();
    if (
      points["data"][to].points >
      this.lvls["s" + String(points["data"][to].lvl)]
    ) {
      var level = Math.floor(
        points["data"][to].points /
          this.lvls["s" + String(points["data"][to].lvl)],
      );
       await collection.updateOne({"name": to}, {$set: {points: points["data"][to].points - this.lvls["s" + String(points["data"][to].lvl)]}});
      await collection.updateOne({"name": to}, {$inc: {level: level}});
    }
    console.log(points["data"][to]);
  }

  deductPoints(pointsToDeduct, from) {
    if (pointsToDeduct > this.points) {
      return;
    } else {
      points["data"][from].points -= pointsToDeduct;
      if (points["data"][from].points < 0) {
        points["data"][from].points += this.lvls[points["data"][to].lvl];
        points["data"][from].lvl -= 1;
      }
    }
  }

  getBalance(of) {
    return points["data"][of];
  }
}
const ps = new PointSystem(0);
app.get("/", (req, res) => {
  res.send(fs.readFileSync("index.html", "utf8"));
  res.status(200);
});
app.post("/set-points", async (req, res) => {
  await getDocs();
  const { name, points: amount } = req.body;
  if (parseInt(amount) > 0)
    await ps.addPoints(amount, ids[capitalizeFirstLetter(name)]);
  else ps.deductPoints(amount, ids[capitalizeFirstLetter(name)]);
  res.status(200).json({ ok: true });
  fs.writeFileSync("db.json", JSON.stringify(points));
});

app.get("/points", (req, res) => {
  points["data"].sort((a,b) => b.points - a.points);
  res.json(points["data"]);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
