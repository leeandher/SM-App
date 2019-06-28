const firebase = require("firebase");
const admin = require("firebase-admin");
const db = admin.firestore();

const { catchErrors } = require("../utils");

exports.signUp = catchErrors(
  async (req, res) => {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle
    };

    // TODO: Validate data

    let userToken, userId;
    const doc = await db.doc(`/users/${newUser.handle}`).get();
    if (doc.exists) {
      return res.status(400).json({ handle: "This handle is already taken." });
    }
    const { user } = await firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password);

    userId = user.uid;
    userToken = await user.getIdToken();
    const newUserCredentials = {
      handle: newUser.handle,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      userId
    };
    await db.doc(`/users/${newUser.handle}`).set(newUserCredentials);
    return res.status(201).json({
      userToken
    });
  },
  (err, req, res) => {
    if (err.code === "auth/email-already-in-use") {
      return res.status(400).json({
        email: "Email is already in use"
      });
    }
    console.error(err);
    return res
      .status(500)
      .json({ error: `(${err.code}) Could not create new user.` });
  }
);
