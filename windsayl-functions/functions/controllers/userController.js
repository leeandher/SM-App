const Busboy = require('busboy')
const path = require('path')
const os = require('os')
const fs = require('fs')
const uuidv4 = require('uuid/v4')
const firebase = require('firebase')
const admin = require('firebase-admin')

const db = admin.firestore()

const firebaseConfig = require('../etc/firebaseConfig.json')
const { isEmpty, isEmail, cleanUserData } = require('../util/validators')
const { catchErrors } = require('../util/errors')

exports.signUp = catchErrors(
  async (req, res) => {
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle
    }

    // Validation
    const errors = {}

    if (isEmpty(newUser.email)) errors.email = 'Must not be empty'
    else if (!isEmail(newUser.email)) errors.email = 'Must be a valid email'

    if (isEmpty(newUser.password)) errors.password = 'Must not be empty'
    if (newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = 'Passwords must match'
    }

    if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty'

    if (Object.keys(errors).length > 0) return res.status(400).json(errors)

    // Setup default display picture
    const defaultDisplayPicture = `https://firebasestorage.googleapis.com/v0/b/${
      firebaseConfig.storageBucket
    }/0/wave.jpg?alt=media`

    // Check for handle
    let userToken, userId
    const doc = await db.doc(`/users/${newUser.handle}`).get()
    if (doc.exists) {
      return res.status(400).json({ handle: 'This handle is already taken' })
    }

    // Create the Firebase User Auth
    const { user } = await firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password)

    // Get their IdToken and save them to the DB
    userId = user.uid
    userToken = await user.getIdToken()
    const newUserCredentials = {
      handle: newUser.handle,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      displayPicture: defaultDisplayPicture,
      userId
    }
    await db.doc(`/users/${newUser.handle}`).set(newUserCredentials)

    // Return the IdToken
    return res.status(201).json({
      userToken
    })
  },
  (err, req, res) => {
    if (err.code === 'auth/email-already-in-use') {
      return res.status(400).json({
        email: 'Email is already in use'
      })
    }
    if (err.code === 'auth/weak-password') {
      return res.status(400).json({
        password: 'Your password must be at least 6 characters'
      })
    }
    console.error(err)
    return res
      .status(500)
      .json({ general: `Something went wrong, please try again!` })
  }
)

exports.login = catchErrors(
  async (req, res) => {
    const user = {
      email: req.body.email,
      password: req.body.password
    }

    // Validation
    const errors = {}

    if (isEmpty(user.email)) errors.email = 'Must not be empty'
    if (isEmpty(user.password)) errors.password = 'Must not be empty'

    if (Object.keys(errors).length > 0) return res.status(400).json(errors)

    const data = await firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
    const userToken = await data.user.getIdToken()
    return res.json({ userToken })
  },
  (err, req, res) => {
    console.error(err)
    return res.status(403).json({
      general: 'Invalid credentials, please try again'
    })
  }
)

exports.updateUser = catchErrors(
  async (req, res) => {
    let userData = cleanUserData(req.body)
    await db.doc(`/users/${req.user.handle}`).update(userData)
    return res.json({ message: 'Details have been edited' })
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not edit user` })
  }
)

exports.getUserPublic = catchErrors(
  async (req, res) => {
    const { handle } = req.params
    // Get user info
    const userDoc = await db.doc(`/users/${handle}`).get()
    if (!userDoc.exists) {
      return res.status(404).json({ error: '🤷‍♀️ User not found! 🤷‍♂️' })
    }
    const user = userDoc.data()
    // Get user's wave info
    const waveDocs = await db
      .collection('waves')
      .where('handle', '==', handle)
      .orderBy('createdAt', 'desc')
      .get()
    const waves = []
    waveDocs.forEach(doc =>
      waves.push({
        body: doc.data().body,
        handle: doc.data().handle,
        displayPicture: doc.data().displayPicture,
        commentCount: doc.data().commentCount,
        splashCount: doc.data().splashCount,
        rippleCount: doc.data().rippleCount,
        createdAt: doc.data().createdAt,
        waveId: doc.tmpdir
      })
    )
    return res.json({ user, waves })
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not get user details` })
  }
)

exports.getUserPrivate = catchErrors(
  async (req, res) => {
    // Get user info
    const userDoc = await db.doc(`/users/${req.user.handle}`).get()
    if (!userDoc.exists) {
      return res.status(404).json({ error: '🤷‍♀️ User not found! 🤷‍♂️' })
    }
    const credentials = userDoc.data()
    // Get this user's splashes
    const splashDocs = await db
      .collection('splashes')
      .where('handle', '==', req.user.handle)
      .get()
    const splashes = []
    splashDocs.forEach(doc => splashes.push(doc.data()))
    // Get this user's notifications
    const notifDocs = await db
      .collection('notifications')
      .where('recipient', '==', req.user.handle)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
    const notifications = []
    notifDocs.forEach((doc, i) => {
      notifications.push({
        createdAt: doc.data().createdAt,
        read: doc.data().read,
        recipient: doc.data().recipient,
        sender: doc.data().sender,
        type: doc.data().type,
        waveId: doc.data().waveId,
        notificationId: doc.id
      })
    })
    return res.json({
      credentials,
      splashes,
      notifications
    })
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not get user info` })
  }
)

exports.markNotifications = catchErrors(
  async (req, res) => {
    const notifBatch = db.batch()
    const { notifications: notifs } = req.body
    notifs.forEach(notifId => {
      const notifDoc = db.doc(`/notifications/${notifId}`)
      notifBatch.update(notifDoc, { read: true })
    })
    await notifBatch.commit()
    res.json({ message: `💌 ${notifs.length} Notifications marked as read 💌` })
  },
  (err, req, res) => {
    console.error(err)
    return res.status(500).json({
      error: `(${err.code || '❌'}) Could not mark notifications as read`
    })
  }
)

// TODO: Repair
exports.uploadImage = catchErrors(
  (req, res) => {
    const busboy = new Busboy({ headers: req.headers })
    let imageFileName, uploadImage

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const imageExtension = filename.split('.')[filename.split('.').length - 1]
      imageFileName = `${uuidv4()}.${imageExtension}`
      const filePath = path.join(os.tmpdir(), imageFileName)
      uploadImage = { filePath, mimetype }
      file.pipe(fs.createWriteStream(filePath))
    })

    busboy.on('finish', async () => {
      await admin
        .storage()
        .bucket()
        .upload(uploadImage.filePath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: uploadImage.mimetype
            }
          }
        })
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
        firebaseConfig.storageBucket
      }/o/${imageFileName}?alt=media`
      await db
        .doc(`/users/${req.user.handle}`)
        .update({ displayPicture: imageUrl })
      return res.json({
        message: 'Image was successfully uploaded'
      })
    })
    busboy.end(req.rawBody)
  },
  (err, req, res) => {
    console.error(err)
    return res.status(500).json({
      error: `(${err.code || '❌'}) Could not upload display picture`
    })
  }
)
