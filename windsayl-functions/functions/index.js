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
app.post('/signup', userController.signUp)
app.post('/login', userController.login)
app.post('/user/image', authController.verifyToken, userController.uploadImage)

exports.api = functions.https.onRequest(app)
