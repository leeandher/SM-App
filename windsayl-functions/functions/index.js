const functions = require("firebase-functions");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://windsayl.firebaseio.com"
});

exports.getWaves = functions.https.onRequest((req, res) => {
  admin
    .firestore()
    .collection("waves")
    .get()
    .then(data => {
      const waves = [];
      data.forEach(doc => waves.push(doc.data()));
      return res.json(waves);
    })
    .catch(console.error);
});

exports.createWave = functions.https.onRequest((req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: `${req.method} Method not allowed` });
  }
  const newWave = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  };
  console.log(JSON.stringify(newWave));

  admin
    .firestore()
    .collection("waves")
    .add(newWave)
    .then(({ id }) =>
      res.json({ message: `Wave (ID: ${id}) was successfully created.` })
    )
    .catch(err => {
      res.status(500).json({ error: "Could not create new wave." });
      console.error(err);
    });
});
