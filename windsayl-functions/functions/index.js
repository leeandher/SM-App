const app = require("express")();

const firebase = require("firebase");
const firebaseConfig = require("./etc/firebaseConfig.json");
firebase.initializeApp(firebaseConfig);

const admin = require("firebase-admin");
const serviceAccount = require("./etc/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://windsayl.firebaseio.com"
});

const functions = require("firebase-functions");

// Get all waves
app.get("/waves", (req, res) => {
  admin
    .firestore()
    .collection("waves")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      const waves = [];
      data.forEach(doc =>
        waves.push({
          id: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        })
      );
      return res.json(waves);
    })
    .catch(console.error);
});

// Add a wave
app.post("/waves", (req, res) => {
  const newWave = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
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

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    userHandle: req.body.userHandle
  };

  // TODO: Validate data
  console.log(JSON.stringify(firebaseConfig));
  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return res.status(201).json({
        message: `User (ID: ${data.user.uid}) was successfully created.`
      });
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: `(${err.code}) Could not create new user.` });
      console.error(err);
    });
});

exports.api = functions.https.onRequest(app);
