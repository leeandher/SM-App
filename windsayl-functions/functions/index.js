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

const functions = require('firebase-functions')

const authController = require('./controllers/authController')
const waveController = require('./controllers/waveController')
const userController = require('./controllers/userController')

// Routing

app.get('/wave', waveController.getWaves)
app.post('/wave', authController.verifyToken, waveController.createWave)
app.get('/wave/:waveId', waveController.getWave)
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

// TODO: Ripple a wave (retweet) - SELF MADE

app.post('/signup', userController.signUp)
app.post('/login', userController.login)
app.get('/user/data', authController.verifyToken, userController.getData)
app.post('/user/image', authController.verifyToken, userController.uploadImage)
app.post('/user/edit', authController.verifyToken, userController.editUser)

exports.api = functions.https.onRequest(app)
