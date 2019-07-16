const admin = require('firebase-admin')
const functions = require('firebase-functions')

const db = admin.firestore()

const { catchDBErrors } = require('../util/errors')

exports.createRippleNotification = functions.firestore
  .document('ripples/{id}')
  .onCreate(
    catchDBErrors(async rippleDoc => {
      // 1. Find the associated wave
      const waveDoc = await db.doc(`/waves/${rippleDoc.data().waveId}`).get()
      // 2. Check if wave exists
      if (!waveDoc.exists) {
        throw new Error(`❌ Ripple ${rippleDoc.id} has an invalid wave ❌`)
      }
      // 3. If the user sending isn't the recipient
      if (waveDoc.data().handle !== rippleDoc.data().handle) {
        // 4. Create the notification
        await db.doc(`/notifications/${rippleDoc.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: waveDoc.data().handle,
          sender: rippleDoc.data().handle,
          type: 'ripple',
          read: false,
          waveId: waveDoc.id
        })
      }
    })
  )

exports.deleteRippleNotification = functions.firestore
  .document('ripples/{id}')
  .onDelete(
    catchDBErrors(async rippleDoc => {
      await db.doc(`/notifications/${rippleDoc.id}/`).delete()
    })
  )

exports.createSplashNotification = functions.firestore
  .document('splashes/{id}')
  .onCreate(
    catchDBErrors(async splashDoc => {
      // 1. Find the associated wave
      const waveDoc = await db.doc(`/waves/${splashDoc.data().waveId}`).get()
      // 2. Check if wave exists
      if (!waveDoc.exists) {
        throw new Error(`❌ Splash ${splashDoc.id} has an invalid wave ❌`)
      }
      if (waveDoc.data().handle !== splashDoc.data().handle) {
        // 3. Create the notification
        await db.doc(`/notifications/${splashDoc.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: waveDoc.data().handle,
          sender: splashDoc.data().handle,
          type: 'splash',
          read: false,
          waveId: waveDoc.id
        })
      }
    })
  )

exports.deleteSplashNotification = functions.firestore
  .document('splashes/{id}')
  .onDelete(
    catchDBErrors(async splashDoc => {
      await db.doc(`/notifications/${splashDoc.id}/`).delete()
    })
  )

exports.createCommentNotification = functions.firestore
  .document('comments/{id}')
  .onCreate(
    catchDBErrors(async commentDoc => {
      // 1. Find the associated wave
      const waveDoc = await db.doc(`/waves/${commentDoc.data().waveId}`).get()
      // 2. Check if wave exists
      if (!waveDoc.exists) {
        throw new Error(`❌ Comment ${commentDoc.id} has an invalid wave ❌`)
      }
      if (waveDoc.data().handle !== commentDoc.data().handle) {
        // 3. Create the notification
        await db.doc(`/notifications/${commentDoc.id}`).set({
          createdAt: new Date().toISOString(),
          recipient: waveDoc.data().handle,
          sender: commentDoc.data().handle,
          type: 'comment',
          read: false,
          waveId: waveDoc.id
        })
      }
    })
  )

exports.deleteCommentNotification = functions.firestore
  .document('comments/{id}')
  .onDelete(
    catchDBErrors(async commentDoc => {
      await db.doc(`/notifications/${commentDoc.id}/`).delete()
    })
  )
