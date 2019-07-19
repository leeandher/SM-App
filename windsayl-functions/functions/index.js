const app = require("express")()

// Allow cross-origin requests
const cors = require("cors")
app.use(cors({ origin: true }))

// Initialize the Firebase App
const firebase = require("firebase")
const firebaseConfig = require("./etc/firebaseConfig.json")
firebase.initializeApp(firebaseConfig)

const admin = require("firebase-admin")
const serviceAccount = require("./etc/serviceAccountKey.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://windsayl.firebaseio.com"
})

const functions = require("firebase-functions")

const authController = require("./controllers/authController")
const waveController = require("./controllers/waveController")
const userController = require("./controllers/userController")
const notifController = require("./controllers/notifController")
const triggerController = require("./controllers/triggerController")

// Get all waves
app.get("/wave", waveController.getWaves)
// Get a specific wave
app.get("/wave/:waveId", waveController.getWave)
// Create a wave
app.post("/wave", authController.verifyToken, waveController.createWave)
// Delete a wave
app.delete(
  "/wave/:waveId",
  authController.verifyToken,
  waveController.deleteWave
)
// Create a ripple
app.post(
  "/wave/:waveId/ripple",
  authController.verifyToken,
  waveController.createRipple
)
// Delete a ripple
app.delete(
  "/wave/:waveId/ripple",
  authController.verifyToken,
  waveController.deleteRipple
)
// Create a comment
app.post(
  "/wave/:waveId/comment",
  authController.verifyToken,
  waveController.createComment
)
// Delete a comment
app.delete(
  "/wave/:waveId/comment/:commentId",
  authController.verifyToken,
  waveController.deleteComment
)
// Splash a wave
app.get(
  "/wave/:waveId/splash",
  authController.verifyToken,
  waveController.createSplash
)
// Unsplash a wave
app.delete(
  "/wave/:waveId/splash",
  authController.verifyToken,
  waveController.deleteSplash
)

// Read notifications
app.post(
  "/notifications",
  authController.verifyToken,
  userController.markNotifications
)

// Signup
app.post("/signup", userController.signUp)
// Login
app.post("/login", userController.login)
// Get private user data
app.get("/user/data", authController.verifyToken, userController.getUserPrivate)
// Get public  user data
app.get("/user/:handle", userController.getUserPublic)
// Upload display picture
// TODO: Fix and reimplement
app.post("/user/image", authController.verifyToken, userController.uploadImage)
// Edit user details
app.post("/user/edit", authController.verifyToken, userController.updateUser)

// Add routes at /api
exports.api = functions.https.onRequest(app)

// Notifications
exports.createRippleNotification = notifController.createRippleNotification
exports.deleteRippleNotification = notifController.deleteRippleNotification
exports.createCommentNotification = notifController.createCommentNotification
exports.deleteCommentNotification = notifController.deleteCommentNotification
exports.createSplashNotification = notifController.createSplashNotification
exports.deleteSplashNotification = notifController.deleteSplashNotification

// Triggers
exports.onUpdateUser = triggerController.onUpdateUser
exports.onDeleteWave = triggerController.onDeleteWave
