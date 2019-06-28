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

const { catchErrors } = require("./utils");
const waveController = require("./controllers/waveController");
const userController = require("./controllers/userController");

app.get("/waves", waveController.getWaves);
app.post("/waves", waveController.createWave);
app.post(
  "/signup",
  catchErrors(userController.signUp, (err, req, res) => {
    if (err.code === "auth/email-already-in-use") {
      return res.status(400).json({
        email: "Email is already in use"
      });
    }
    console.error(err);
    return res
      .status(500)
      .json({ error: `(${err.code}) Could not create new user.` });
  })
);

exports.api = functions.https.onRequest(app);
