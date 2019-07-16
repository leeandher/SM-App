# Advanced Functions

## Cloud Triggers

When making any changes to data-sets in the database, Firebase allows you to lazily operate separate functions, which really just wait for the chance to run. These apply on any of your initialized collections, and allow you to setup code to write `onUpdate`, `onCreate` or even `onDelete`.

These guys can be useful for creating side effects, or other things like notifications after certain actions have been taken by the users.

Setting up a Cloud Trigger is done as follows:

```js
exports.onUpdateUser = functions.firestore
  .document('users/{id}')
  .onUpdate(({ before: userDocBefore, after: userDocAfter }) => {
    // ...
  })
```

As you can see, it doesn't follow the standard Express `(req, res, next)` parameters, and that because this is entirely run in the cloud, and should not result in any output to a client, since they aren't triggered by any request directly.

It should also be noted that the item sent back as an argument is actually a snapshot document of the change that just occurred. These are specified in more detail in the actual Firebase Docs. You can actually use certain parts of the document as a parameter for added functionality, by specifying curly braces:

```js
exports.onDeleteItem = functions.firestore.document('items/{id}').onDelete(
  async (itemDoc, ctx) => {
    // ctx.params refers to the 'items/{id}'
    const { id: itemId } = ctx.params
    // ...
  }
```

Unfortunately, without a Cloud Firestore Emulator, these can only be tested directly with `firebase deploy` and using the live endpoint. `firebase serve` will still make changes in the database, and those will trigger these side effects, but any updates you do locally will not be reflected until you `firebase deploy` again.

## Batching Operations

Often times, you'll be making many changes to the database with a single update. Considering how much duplicate data you might have, due to reducing reads and writes, you might have to change some values across your entire database in one fell swoop.

If this use-case does come up, the best way to structure it is with a **batch operation**. Think of a batch operation like a series of commands you're telling the cloud to run together to speed up the process, and reduce reads/writes.

Setting up batches is really easy:

```js
// Declare the batch that you will be filling with operations
const itemBatch = db.batch()
// Add in any operations you want to accomplish in the batch
itemBatch.delete(/* ... */)
itemBatch.update(/* ... */)
itemBatch.create(/* ... */)
// Perform the above mentioned operations
await itemBatch.commit()
```

They can be used as an extension of the existing **Firestore SDK**, but must be set up as an instance:

```js
// Works
const itemBatch = db.batch()
itemBatch.delete(/* ... */)
itemBatch.update(/* ... */)
itemBatch.create(/* ... */)
await itemBatch.commit()
```

```js
// Does not work
db.batch().delete(/* ... */)
db.batch().update(/* ... */)
db.batch().create(/* ... */)
await db.batch().commit()
```
