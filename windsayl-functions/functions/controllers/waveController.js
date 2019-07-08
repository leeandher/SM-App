const firebase = require('firebase')
const admin = require('firebase-admin')
const db = admin.firestore()

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
    return res.status(500).json({ error: 'Could not get waves' })
  }
)

exports.createWave = catchErrors(
  async (req, res) => {
    const newWave = {
      body: req.body.body,
      handle: req.user.handle,
      createdAt: new Date().toISOString(),
      rippleCount: 0
    }
    const { id } = await db.collection('waves').add(newWave)
    res.json({ message: `Wave (ID: ${id}) was successfully created` })
  },
  (err, req, res) => {
    console.error(err)
    return res.status(500).json({ error: 'Could not create new wave' })
  }
)

exports.rippleWave = catchErrors(
  async (req, res) => {
    const { waveId } = req.params
    // 1. Get original wave, error if not found
    const waveDoc = await db.doc(`/waves/${waveId}`).get()
    // 2. If not found, error out
    if (!waveDoc.exists) {
      return res.status(404).json({ error: `Wave ${waveId} was not found!` })
    }
    // 3. Create the ripple
    const newRipple = {
      body: waveDoc.data().body,
      handle: waveDoc.data().handle,
      createdAt: new Date().toISOString(),
      rippleHandle: req.user.handle
    }
    // 4. Save the ripple to the data store
    await db.collection('waves').add(newWave)
    // 5. Increase the rippleCount of the original wave
    await db
      .doc(`/waves/${waveId}`)
      .update({ rippleCount: waveDoc.data().rippleCount + 1 })
    // 6. Return the new ripple data
    return res.json(newRipple)
  },
  (err, req, res) => {
    console.error(err)
    return res.status(500).json({ error: 'Could not ripple this wave' })
  }
)
