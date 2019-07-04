const firebase = require('firebase')
const admin = require('firebase-admin')
const db = admin.firestore()

const { catchErrors } = require('../util/errors')

exports.verifyToken = catchErrors(
  async (req, res, next) => {
    let idToken
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      idToken = req.headers.authorization.split('Bearer ')[1]
    } else {
      console.error('No token found')
      res.status(403).json({ error: 'Unauthorized' })
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken)
    req.user = decodedToken

    const {
      docs: [item]
    } = await db
      .collection('users')
      .where('userId', '==', req.user.uid)
      .limit(1)
      .get()
    req.user.handle = item.data().handle
    return next()
  },
  (err, req, res) => {
    console.error('Error verifying token', err)
    return res.status(403).json(err)
  }
)
