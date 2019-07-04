const firebase = require('firebase')
const admin = require('firebase-admin')
const db = admin.firestore()

const { isEmpty } = require('../util/validators')
const { catchErrors } = require('../util/errors')

exports.getWaves = catchErrors(
  async (req, res) => {
    const waves = []
    const data = await db
      .collection('waves')
      .orderBy('createdAt', 'desc')
      .get()
    data.forEach(doc =>
      waves.push({
        id: doc.id,
        body: doc.data().body,
        handle: doc.data().handle,
        createdAt: doc.data().createdAt
      })
    )
    return res.json(waves)
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not get waves` })
  }
)

exports.getWave = catchErrors(
  async (req, res) => {
    const { waveId } = req.params
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} not found.` })
    }
    const waveData = doc.data()
    const commentDocs = await db
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .where('waveId', '==', waveId)
      .get()
    waveData.waveId = waveId
    waveData.comments = []
    commentDocs.forEach(doc => waveData.comments.push(doc.data()))
    return res.json(waveData)
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not get wave` })
  }
)

exports.createWave = catchErrors(
  async (req, res) => {
    const newWave = {
      body: req.body.body,
      handle: req.user.handle,
      displayPicture: req.user.displayPicture,
      createdAt: new Date().toISOString(),
      splashCount: 0,
      commentCount: 0
    }
    const { id } = await db.collection('waves').add(newWave)
    newWave.waveId = id
    return res.json(newWave)
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not create new wave` })
  }
)

exports.createComment = catchErrors(
  async (req, res) => {
    if (isEmpty(req.body.body)) {
      return res.status(400).json({ error: 'Must not be empty' })
    }
    const { waveId } = req.params
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} not found.` })
    }

    const newComment = {
      body: req.body.body,
      handle: req.user.handle,
      displayPicture: req.user.displayPicture,
      createdAt: new Date().toISOString(),
      waveId: waveId
    }
    await db.collection('comments').add(newComment)
    await db
      .doc(`/waves/${waveId}`)
      .update({ commentCount: waveDoc.data().commentCount + 1 })
    return res.json(newComment)
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not create new comment` })
  }
)

exports.deleteComment = catchErrors(
  async (req, res) => {
    const { waveId, commentId } = req.params
    const { handle } = req.user
    // 1. Check if wave exists
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} not found.` })
    }
    // 2. Check if comment exists
    const commentDoc = await db.doc(`/comments/${commentId}`).get()
    if (!commentDoc.exists) {
      return res.status(404).json({ error: `Comment ${commentId} not found.` })
    }
    // 3. Check if user made the comment
    if (handle !== commentDoc.data().handle) {
      return res
        .status(403)
        .json({ error: "You cannot delete someone else's comment" })
    }
    // 4. Delete the comment
    await db.doc(`comments/${commentId}`).delete()
    // 5. Update the wave
    const updatedWave = waveDoc.data()
    updatedWave.commentCount--
    await db
      .doc(`/waves/${waveId}`)
      .update({ splashCount: updatedWave.splashCount })
    // 6. Return the wave
    return res.json(updatedWave)
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not delete comment` })
  }
)

exports.createSplash = catchErrors(
  async (req, res) => {
    const { waveId } = req.params
    const { handle } = req.user
    // 1. Check if wave exists
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} not found.` })
    }
    // 2. Check if splash is already present
    const splashDocs = await db
      .collection('/splashes')
      .where('handle', '==', handle)
      .where('waveId', '==', waveId)
      .limit(1)
      .get()
    if (!splashDocs.empty) {
      return res
        .status(400)
        .json({ error: `You cannot splash a wave you've already splashed!` })
    }
    // 3. If not, create it
    await db.collection('splashes').add({ waveId, handle })
    // 4. Update the splash count on the wave
    const updatedWave = waveDoc.data()
    updatedWave.splashCount++
    await db
      .doc(`/waves/${waveId}`)
      .update({ splashCount: updatedWave.splashCount })
    // 5. Return the wave data
    return res.json(updatedWave)
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not splash this wave` })
  }
)

exports.deleteSplash = catchErrors(
  async (req, res) => {
    const { waveId } = req.params
    const { handle } = req.user
    // 1. Check if wave exists
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} not found.` })
    }
    // 2. Check if splash is already present
    const splashDocs = await db
      .collection('/splashes')
      .where('handle', '==', handle)
      .where('waveId', '==', waveId)
      .limit(1)
      .get()
    if (splashDocs.empty) {
      return res
        .status(400)
        .json({ error: `You cannot unsplash a wave you haven't splashed!` })
    }
    // 3. If so, delete it
    await db.doc(`/splashes/${splashDocs.docs[0].id}`).delete()
    // 4. Update the splash count on the wave
    const updatedWave = waveDoc.data()
    updatedWave.splashCount--
    await db
      .doc(`/waves/${waveId}`)
      .update({ splashCount: updatedWave.splashCount })
    // 5. Return the wave data
    return res.json(updatedWave)
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not unsplash this wave` })
  }
)
