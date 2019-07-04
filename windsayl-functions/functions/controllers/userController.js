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
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code}) Could not create new user` })
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
    console.log(JSON.stringify(data.getIdToken))
    const token = await data.user.getIdToken()
    return res.json({ token })
  },
  (err, req, res) => {
    if (err.code === 'auth/wrong-password') {
      return res.status(403).json({
        general: 'Incorrect password, please try again'
      })
    }
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not login` })
  }
)

exports.editUser = catchErrors(
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

exports.getData = catchErrors(
  async (req, res) => {
    const doc = await db.doc(`/users/${req.user.handle}`).get()
    if (!doc.exists) throw new Error('User does not exist!')
    const credentials = doc.data()
    const likeDocs = await db
      .collection('likes')
      .where('userHandle', '==', req.user.handle)
      .get()
    const likes = []
    likeDocs.forEach(doc => likes.push(doc.data()))
    return res.json({
      credentials,
      likes
    })
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not get user info` })
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
