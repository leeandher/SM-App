const app = require('express')()

// Initialize the Firebase App
const firebase = require('firebase')
const firebaseConfig = require('./etc/firebaseConfig.json')
firebase.initializeApp(firebaseConfig)

const admin = require('firebase-admin')
const serviceAccount = require('./etc/serviceAccountKey.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://windsayl.firebaseio.com'
})

const db = admin.firestore()
const functions = require('firebase-functions')

const authController = require('./controllers/authController')
const waveController = require('./controllers/waveController')
const userController = require('./controllers/userController')
const notifController = require('./controllers/notifController')

// Routing
app.get('/wave', waveController.getWaves)
app.post('/wave', authController.verifyToken, waveController.createWave)
app.get('/wave/:waveId', waveController.getWave)
app.delete(
  '/wave/:waveId',
  authController.verifyToken,
  waveController.deleteWave
)
app.post(
  '/wave/:waveId/ripple',
  authController.verifyToken,
  waveController.createRipple
)
app.delete(
  '/wave/:waveId/ripple',
  authController.verifyToken,
  waveController.deleteRipple
)
app.post(
  '/wave/:waveId/comment',
  authController.verifyToken,
  waveController.createComment
)
app.delete(
  '/wave/:waveId/comment/:commentId',
  authController.verifyToken,
  waveController.deleteComment
)
app.get(
  '/wave/:waveId/splash',
  authController.verifyToken,
  waveController.createSplash
)
app.delete(
  '/wave/:waveId/splash',
  authController.verifyToken,
  waveController.deleteSplash
)

app.post('/signup', userController.signUp)
app.post('/login', userController.login)
app.get('/user/data', authController.verifyToken, userController.getData)
app.post('/user/image', authController.verifyToken, userController.uploadImage)
app.post('/user/edit', authController.verifyToken, userController.editUser)

// Add routes at /api
exports.api = functions.https.onRequest(app)

// Notifications
exports.createRippleNotification = notifController.createRippleNotification
exports.deleteRippleNotification = notifController.deleteRippleNotification
exports.createCommentNotification = notifController.createCommentNotification
exports.deleteCommentNotification = notifController.deleteCommentNotification
exports.createSplashNotification = notifController.createSplashNotification
exports.deleteSplashNotification = notifController.deleteSplashNotification
