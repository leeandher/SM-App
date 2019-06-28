const firebase = require("firebase");
const admin = require("firebase-admin");
const db = admin.firestore();

exports.getWaves = async (req, res) => {
  db.collection("waves")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      const waves = [];
      data.forEach(doc =>
        waves.push({
          id: doc.id,
          body: doc.data().body,
          handle: doc.data().handle,
          createdAt: doc.data().createdAt
        })
      );
      return res.json(waves);
    })
    .catch(console.error);
};

exports.createWave = async (req, res) => {
  const newWave = {
    body: req.body.body,
    handle: req.body.handle,
    createdAt: new Date().toISOString()
  };
  db.collection("waves")
    .add(newWave)
    .then(({ id }) =>
      res.json({ message: `Wave (ID: ${id}) was successfully created.` })
    )
    .catch(err => {
      res.status(500).json({ error: "Could not create new wave." });
      console.error(err);
    });
};
