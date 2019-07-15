# Serverless Structure

## Initialization

Firebase's Node SDK is really powerful for creating serverless functions with ease. All it takes is to initialize the firebase app, and it's admin profile in order to get access to the database:

```js
const app = require('express')()

const firebase = require('firebase')
const firebaseConfig = require('./etc/firebaseConfig.json')
firebase.initializeApp(firebaseConfig)

const admin = require('firebase-admin')
const serviceAccount = require('./etc/serviceAccountKey.json')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${YOUR_PROJECT_ID}.firebaseio.com`
})

const db = admin.firestore()
const functions = require('firebase-functions')
```

You can also see here that there we are using some other imports in our `index.js` file. Even though it's serverless, we are still going to use `express` simply because it makes setting up routes for the API easier.

The functions can pretty much follow the exact same method you would normally use with other Express.js apps. You can actually set up a `hello-world` by exporting a function from this file using the `firebase-functions` package:

```js
app.get('/hello-world', (req, res) => {
  res.json({ message: 'Hello from Firebase!' })
})

exports.api = functions.https.onRequest(app)
```

You've now setup a REST hello-world endpoint, so all that is left is to implement/deploy it!

## Development Setup

Now that you have your first route has been setup, we can work on deployment. There are two methods of testing your endpoint, but you'll definitely need an API environment like [Postman](https://www.getpostman.com/downloads/).

1. You can deploy your endpoint to a live cloud server with the command`firebase deploy`. After deployment, you can check out the Firebase Console on the Functions tab to get an endpoint to check out.
2. You can serve your endpoint locally to test with the `firebase serve` command. It is much faster and **recommended for development**.

Both endpoints will still be able to make changes to the firebase services (Firestore DB, Authentication, etc.), so it is much better to go with method 2.

Now you should be ready to start developing endpoints for your serverless functions!

## Understanding Functions

Setting up these functions is easier than you think. The folder structure I recommend is the following:

```
functions/
| | controllers/
| | | userController.js
| | | itemController.js
| | | ...
| | etc/
| | | firebaseConfig.json
| | | serviceAccountKey.json
| | util/
| | | helpers.js
| | | validators.js
| | | ...
| datamodel.json
| index.js
| package.json
| package-lock.json
.firebaserc
.gitignore
firebase.json
```

The `index.js` file will declare the entire backend, but you shouldn't be writing any code in there, since it will quickly get complicated.

Depending on the appication, you will probably have many functions that are closely related to one another. Things like user account changes, or create/read/update/delete operations on items. The clearest way to organize these are by setting up **controller** files to hold all of the functionality for each of these groups

Now, your `index.js` file will look like the following as you write more endpoints:

```js
app.post('/signup', userController.signUp)
app.post('/login', userController.login)
app.get('/user/data', authController.verifyToken, userController.getUserPrivate)

exports.api = functions.https.onRequest(app)
```

Just like that, your `/signup`, `/login` and `/user/data` routes will be set up!
