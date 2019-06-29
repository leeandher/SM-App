const firebase = require("firebase");
const admin = require("firebase-admin");
const db = admin.firestore();

const { catchErrors } = require("../utils");

exports.getWaves = catchErrors(
  async (req, res) => {
    const waves = [];
    const data = await db
      .collection("waves")
      .orderBy("createdAt", "desc")
      .get();
    data.forEach(doc =>
      waves.push({
        id: doc.id,
        body: doc.data().body,
        handle: doc.data().handle,
        createdAt: doc.data().createdAt
      })
    );
    return res.json(waves);
  },
  (err, req, res) => {
    console.error(err);
    return res.status(500).json({ error: "Could not get waves." });
  }
);

exports.createWave = catchErrors(
  async (req, res) => {
    const newWave = {
      body: req.body.body,
      handle: req.user.handle,
      createdAt: new Date().toISOString()
    };
    const { id } = await db.collection("waves").add(newWave);
    res.json({ message: `Wave (ID: ${id}) was successfully created.` });
  },
  (err, req, res) => {
    console.error(err);
    return res.status(500).json({ error: "Could not create new wave." });
  }
);
