# Writing Functions

## Introduction

When it comes to actually constructing these Firebase functions, there are many _gotchas_, which game me some hell while I was learning. It's important to understand the basics of how the SDK works, and **async/await** can be used to your advantage

## Admin Cloud Firestore

The most complicated part about the application is controlling the reads/writes to the database, and how the data is retrieved and interpreted.

Firebase's basic database system stores items referred to as `documents` in `collections` with a simple directory-like structure. If you have a collection of _posts_, with random UUID's, you can retrieve one document with the following command:

```js
const admin = require('firebase-admin')
const db = admin.firestore()

const itemDoc = await db.doc(`items/${UUID}`).get()
```

Similar to `.get()`, there are also methods to make changes (`.update()`) or delete (`.delete()`) documents.

Each document also has a method to return the data contained inside it: `.data()`, which can be useful for parsing data to return:

```js
return res.json({ data: itemDoc.data() })
/*
{
  data: {
    name: "",
    title: "",
    description: "",
    ...
  }
}
*/
```

The above is all outlined in the Firebase docs as well, so feel free to check those out.

## Specification and Indices

Sometimes when you're performing queries on your data, you won't have any identifiers to go off of, so you'll just send requests for any items which fulfill some criteria. If you've written any SQL, it's pretty much that.

You'll ask for data which has this many _likes_, or belongs to this _user_. Additionally, you can even sort/filter the return data; ordering it, or limiting it to your specifications.

With the JS Firebase SDK, you can do this simply by chaining some of the above methods onto your `db.collection()` call:

```js
const commentDocs = await db
  .collection('comments')
  .orderBy('createdAt', 'desc')
  .where('waveId', '==', waveId)
  .get()
```

This will allow you to easily filter the data you want to modify in your cloud functions. Problem is, this probably won't run once you add enough methods. The reason for this, is that Firebase deems this operation far too complex to perform all willy-nilly, and would prefer you set up an index.

If you run the endpoints with `firebase serve`, upon use, you should see a link in the console which will direct you on making the index using the parameters you in the operation.

Once that's set up you should be good to go!

## Catching Errors

You can do everything above with the `.then` syntax, but personally, I think that makes promises look hella confusing, and way trashy. Instead I usually opt for creating a simple helper function to wrap around **asynchronous functions** and chains a `.catch()` method onto their return value, since it must be a promise.

The function itself may look complicated, but it can be parsed if walked through slowly, as well as how to implement it in controllers. _Here's the function_:

```js
/**
 * @param {function} asyncFunction Asynchronous function which will have the errorHandler attached to it: (req, res, next)
 * @param {function} errorHandler Error handling function which accepts the following parameters: (error, req, res, next)
 * @summary Wrap asynchronous functions with error event handler
 */
exports.catchErrors = (asyncFunction, errorHandler) => {
  return function(req, res, next) {
    return asyncFunction(req, res, next).catch(error =>
      errorHandler(error, req, res, next)
    )
  }
}
```

What this function does, is take in an **asyncFunction** parameter, and attach the **errorHandler** function to it, following the `(req, res, next)` parameter structure of Express.js. The **catchErrors** function, returns a new, nameless, Express response function. It does this to gain access to the `req`, `res`, and `next` parameters.

It passes these along to the _asynchronous function_, running it, but also attaches and passes it to the `.catch` method, containing the _error handler_. Now the functions have access to the Express parameters, and can be declared easily without an ugly try and catch statement.

In the route declaration, it would look something like this:

```js
// itemController.js

exports.getItem = catchErrors(
  async (req, res) => {
    // Use firebase to fetch, filter, and return an itemDoc
    res.json({ itemData })
  },
  (err, req, res) => {
    console.error(err)
    return res
      .status(500)
      .json({ error: `(${err.code || '❌'}) Could not get wave` })
  }
)
```

Now the error handler will be attached to the method easily and the route will still operate as before!

## Common Issues

Often times when initializing the admin app package, Firebase has a hard time setting itself up, leading to some properties with empty values. As of yet, there really isn't a reliable solution, and the method of clearing it up isn't ideal:

For more details on the issue, [check out this issue on Github,](https://github.com/prescottprue/react-redux-firebase/issues/657) but to solve the problem, this worked for me:

```bash
$ rm -rf node_modules
$ npm install --save
$ npm install --save firebase firebase-admin
```
