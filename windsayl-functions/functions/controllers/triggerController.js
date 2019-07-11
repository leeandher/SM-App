const admin = require('firebase-admin')
const functions = require('firebase-functions')

const db = admin.firestore()

const { catchDBErrors } = require('../util/errors')

exports.onUpdateUser = functions.firestore.document('users/{id}').onUpdate(
  catchDBErrors(async ({ before: userDocBefore, after: userDocAfter }) => {
    const { displayPicture } = userDocAfter.data()
    // Ensure the displayPicture has changed
    if (displayPicture === userDocBefore.data().displayPicture) return
    const displayPictureBatch = db.batch()
    // 1. Get all the user's waves, and batch them
    const waveDocs = await db
      .collection('waves')
      .where('handle', '==', userDocBefore.data().handle)
      .get()
    waveDocs.forEach(doc => {
      const waveDoc = db.doc(`/waves/${doc.id}`)
      displayPictureBatch.update(waveDoc, { displayPicture })
    })
    // 2. Get all the user's ripples, and batch them
    const rippleDocs = await db
      .collection('ripples')
      .where('handle', '==', userDocBefore.data().handle)
      .get()
    rippleDocs.forEach(doc => {
      const rippleDoc = db.doc(`/ripples/${doc.id}`)
      displayPictureBatch.update(rippleDoc, { displayPicture })
    })
    // 3. Get all the user's comments, and batch them
    const commentsDocs = await db
      .collection('comments')
      .where('handle', '==', userDocBefore.data().handle)
      .get()
    commentsDocs.forEach(doc => {
      const commentDoc = db.doc(`/comments/${doc.id}`)
      displayPictureBatch.update(commentDoc, { displayPicture })
    })
    // 4. Batch commmit to change all profile pictures
    await displayPictureBatch.commit()
  })
)

exports.onDeleteWave = functions.firestore.document('waves/{id}').onDelete(
  catchDBErrors(async (splashDoc, ctx) => {
    const { id: waveId } = ctx.params
    const waveDeletionBatch = db.batch()
    console.log(waveId)
    // 1. Find any comments, and batch them
    const commentDocs = await db
      .collection('comments')
      .where('waveId', '==', waveId)
      .get()
    commentDocs.forEach(doc => {
      console.log(doc.id, 'comment')
      waveDeletionBatch.delete(db.doc(`/comments/${doc.id}`))
    })
    // 2. Find any splashes, and batch them
    const splashDocs = await db
      .collection('splashes')
      .where('waveId', '==', waveId)
      .get()
    splashDocs.forEach(doc => {
      console.log(doc.id, 'splash')
      waveDeletionBatch.delete(db.doc(`/splashes/${doc.id}`))
    })
    // 3. Find any notifications, and batch them
    const notifDocs = await db
      .collection('notifications')
      .where('waveId', '==', waveId)
      .get()
    notifDocs.forEach(doc => {
      console.log(doc.id, 'notif')
      waveDeletionBatch.delete(db.doc(`/notifications/${doc.id}`))
    })
    // 4. Find any ripples, and batch them
    const rippleDocs = await db
      .collection('ripples')
      .where('waveId', '==', waveId)
      .get()
    rippleDocs.forEach(doc => {
      console.log(doc.id, 'ripple')
      waveDeletionBatch.update(db.doc(`/ripples/${doc.id}`), {
        waveBody: 'This wave has been deleted',
        waveId: `${doc.data().waveId}-deleted`
      })
    })
    // 5. Commit the batch
    await waveDeletionBatch.commit()
  })
)
