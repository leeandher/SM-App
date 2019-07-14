# Setting up Firebase

## Introduction

Firebase is a Google Product intended for fast application development, with little to no setup for modern, light applications. This is done through the help of their development SDK. For the application built while writing these notes, I'll be using the JavaScript SDK for web development.

In this application, Firebase's Cloud Functions will be used to create a **serverless architecture**. _Serverless_ is just a fancy way of saying that there really isn't a dedicated computer running the backend for the site. The front-end will be hosted somewhere, but the backend will just be a series of individual functions hosted by _somewhere_ on the Google Cloud Platform. When the client needs to make a something happen server-side, the endpoint will determine which function (in the cloud) gets run. Even the database is hosted on Firebase, so we'll never have to leave the SDK, and can access everything via our cloud functions.

## Online Setup

First thing's first, you have to login to `console.firebase.google.com` and create a project for your application to live. This will give you access to all the features of firebase that you need. They usually need to be turned on, with a case by case basis. In the case of this application, Authentication, Database, and Functions are the 3 API's that we'll need access to in order to create a serverless social media app.

## Installation


After that, you can setup a basic serverless backend with firebase the first thing you have to install is the Node.js SDK:

```bash
$ npm i -g firebase-tools
```

Now login via the CLI with:

```bash
$ firebase login
```

Now enter the directory you want your serverless functions to live, and run:

```bash
$ firebase init
```

You'll be prompted describe how you want your application structured, and you can set it up however you like. Make sure you check `Functions` as the resource you'd like to initialize. You should see the app you created on the Firebase Console which you can specify too!

This will scaffold out a basic application which you can use to get started with your app!
