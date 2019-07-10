const firebase = require('firebase')
const admin = require('firebase-admin')
const db = admin.firestore()

const { isEmpty } = require('../util/validators')
const { catchErrors } = require('../util/errors')

exports.getWaves = catchErrors(
  async (req, res) => {
    // 1. Get every wave
    const docs = await db
      .collection('waves')
      .orderBy('createdAt', 'desc')
      .get()
    // 2. Create and populate an array for them
    const waves = []
    docs.forEach(doc =>
      waves.push({
        id: doc.id,
        body: doc.data().body,
        handle: doc.data().handle,
        createdAt: doc.data().createdAt
      })
    )
    // 3. Return it
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
    // 1. Check if wave exists
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} not found.` })
    }
    // 2. Get the associated comments
    const commentDocs = await db
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .where('waveId', '==', waveId)
      .get()
    // 3. Form the wave data
    const waveData = doc.data()
    waveData.waveId = waveId
    waveData.comments = []
    // 4. Populate the comment data
    commentDocs.forEach(doc => waveData.comments.push(doc.data()))
    // 5. Return it
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
    // 1. Setup the wave
    const newWave = {
      body: req.body.body,
      handle: req.user.handle,
      displayPicture: req.user.displayPicture,
      createdAt: new Date().toISOString(),
      splashCount: 0,
      commentCount: 0,
      rippleCount: 0
    }
    // 2. Create the wave
    const { id } = await db.collection('waves').add(newWave)
    // 3. Return the waveData and it's id
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

exports.deleteWave = catchErrors(
  async (req, res) => {
    const waveDeletionBatch = db.batch()
    const { waveId } = req.params
    const { handle } = req.user
    // 1. Check if wave exists
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} not found.` })
    }
    // 2. Check if user made the wave
    if (handle !== waveDoc.data().handle) {
      return res
        .status(403)
        .json({ error: "You cannot delete someone else's wave" })
    }
    // 3. Find any comments, and delete them
    const commentDocs = await db
      .collection('comments')
      .where('waveId', '==', waveId)
      .get()
    commentDocs.forEach(doc => {
      waveDeletionBatch.delete(db.doc(`/comments/${doc.id}`))
    })
    // 4. Find any splashes, and delete them
    const splashDocs = await db
      .collection('splashes')
      .where('waveId', '==', waveId)
      .get()
    splashDocs.forEach(doc => {
      waveDeletionBatch.delete(db.doc(`/splashes/${doc.id}`))
    })
    // 5. Delete the wave
    waveDeletionBatch.delete(db.doc(`/waves/${waveId}`))
    await waveDeletionBatch.commit()
    // 6. Return a success message
    return res.json({
      message: `Successfully deleted wave ${waveId}, it's splashes, and comments`
    })
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not delete wave` })
  }
)

exports.createComment = catchErrors(
  async (req, res) => {
    const { waveId } = req.params
    // 1. Check if the comment is empty
    if (isEmpty(req.body.body)) {
      return res.status(400).json({ error: 'Must not be empty' })
    }
    // 2. Check if wave exists
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} not found.` })
    }
    // 3. Form the new comment
    const newComment = {
      body: req.body.body,
      handle: req.user.handle,
      displayPicture: req.user.displayPicture,
      createdAt: new Date().toISOString(),
      waveId: waveId
    }
    // 4. Add it to the database
    const { id } = await db.collection('comments').add(newComment)
    newComment.commentId = id
    // 5. Update the wave's comment count
    await db
      .doc(`/waves/${waveId}`)
      .update({ commentCount: waveDoc.data().commentCount + 1 })
    // 6. Return the comment count
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
    await db.doc(`/comments/${commentId}`).delete()
    // 5. Update the wave
    const updatedWave = waveDoc.data()
    updatedWave.commentCount--
    await db
      .doc(`/waves/${waveId}`)
      .update({ commentCount: updatedWave.commentCount })
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

exports.createRipple = catchErrors(
  async (req, res) => {
    const { waveId } = req.params
    const { handle } = req.user
    // 1. Get original wave, error if not found
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    // 2. If not found, error out
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} was not found!` })
    }
    // 3. Check if the ripple already exists
    const rippleDocs = await db
      .collection('/ripples')
      .where('handle', '==', handle)
      .where('waveId', '==', waveId)
      .limit(1)
      .get()
    if (!rippleDocs.empty) {
      return res
        .status(400)
        .json({ error: `You cannot ripple a wave you've already rippled!` })
    }
    // 4. Create the ripple
    const newRipple = {
      waveId,
      waveBody: waveDoc.data().body,
      waveHandle: waveDoc.data().handle,
      body: req.body.body,
      handle: handle
    }
    // 5. Save the ripple to the data store
    await db.collection('ripples').add(newRipple)
    // 6. Increase the rippleCount of the original wave
    const updatedWave = waveDoc.data()
    updatedWave.rippleCount++
    await db
      .doc(`/waves/${waveId}`)
      .update({ rippleCount: updatedWave.rippleCount })
    // 7. Return the new ripple data
    return res.json(updatedWave)
  },
  (err, req, res) => {
    console.error(err)
    return res.status(500).json({ error: 'Could not ripple this wave' })
  }
)

exports.deleteRipple = catchErrors(
  async (req, res) => {
    const { waveId } = req.params
    const { handle } = req.user
    // 1. Get original wave, error if not found
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    // 2. If not found, error out
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} was not found!` })
    }
    // 3. Check if the ripple already exists
    const rippleDocs = await db
      .collection('/ripples')
      .where('handle', '==', handle)
      .where('waveId', '==', waveId)
      .limit(1)
      .get()
    if (rippleDocs.empty) {
      return res
        .status(400)
        .json({ error: `You cannot delete a ripple you haven't made!` })
    }
    // 3. If so, delete it
    await db.doc(`/ripples/${rippleDocs.docs[0].id}`).delete()
    // 4. Update the rippleCount count on the wave
    const updatedWave = waveDoc.data()
    updatedWave.rippleCount--
    await db
      .doc(`/waves/${waveId}`)
      .update({ rippleCount: updatedWave.rippleCount })
    // 5. Return the new wave data
    return res.json(updatedWave)
  },
  (err, req, res) => {
    console.error(err)
    return res.status(500).json({ error: 'Could not ripple this wave' })
  }
)
