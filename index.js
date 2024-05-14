const express = require("express");
const app = express();
const fs = require("fs");
app.use(express.json());
const cors = require("cors");
app.use(cors());

function keepAlive() {
  setInterval(() => {
    fetch("https://7f260c32-7e49-4bb2-b740-ca0101d967a8-00-3d5sdyvuho42c.riker.repl.co/");
  }, 100);
}

const ids = {
  Darren: 0,
  Dominic: 1,
  Zion: 2,
  Fabrice: 7,
  Solomon: 5,
  Connor: 6,
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
console.log(lvls);
const points = JSON.parse(fs.readFileSync("db.json", "utf-8"));
function sort_function(a, b) {
  return b.points - a.points;
}
points["data"].sort(sort_function);
get_id(points["data"]);
console.log(points["data"]);
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

  addPoints(pointsToAdd, to) {
    points["data"][to].points += pointsToAdd;
    if (
      points["data"][to].points >
      this.lvls["s" + String(points["data"][to].lvl)]
    ) {
      var level = Math.floor(
        points["data"][to].points /
          this.lvls["s" + String(points["data"][to].lvl)],
      );
      points["data"][to].points -=
        this.lvls["s" + String(points["data"][to].lvl)];
      points["data"][to].lvl += level;
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
app.post("/set-points", (req, res) => {
  const { name, points: amount } = req.body;
  if (parseInt(amount) > 0)
    ps.addPoints(amount, ids[capitalizeFirstLetter(name)]);
  else ps.deductPoints(amount, ids[capitalizeFirstLetter(name)]);
  res.status(200).json({ ok: true });
  fs.writeFileSync("db.json", JSON.stringify(points));
});

app.get("/points", (req, res) => {
  res.json(points["data"]);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  keepAlive();
  console.log(`Server running on port ${PORT}`);
});
