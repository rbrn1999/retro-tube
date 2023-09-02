import * as functions from "firebase-functions";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";


initializeApp();

const firestore = new Firestore();
const storage = new Storage();
const rawVideoBucketName = "retro-tube-raw-videos";
const thumbnailBucket = "retro-tube-thumbnails";

export const createUser = functions.auth.user().onCreate((user) => {
  const userInfo = {
    uid: user.uid,
    email: user.email,
    photoUrl: user.photoURL,
  };

  firestore.collection("users").doc(user.uid).set(userInfo);
  logger.info(`User Created: ${JSON.stringify(userInfo)}`);
  return;
});

export const generateUploadVideoUrl =
  onCall({maxInstances: 1}, async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated"
      );
    }

    const auth = request.auth;
    const data = request.data;
    const bucket = storage.bucket(rawVideoBucketName);

    // Generate a unique file name
    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

    // Get a v4 signed URL for uploading file
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });
    return {url, fileName};
  });

export const generateUploadThumbnailUrl =
  onCall({maxInstances: 1}, async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "The function must be called while authenticated"
      );
    }

    const data = request.data;
    const bucket = storage.bucket(thumbnailBucket);

    // Generate a unique file name
    const fileName = `${data.id}.${data.fileExtension}`;

    // Get a v4 signed URL for uploading file
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 2 * 60 * 1000, // 2 minutes
      extensionHeaders: {
        "x-goog-acl": "public-read",
      },
    });
    return {url, fileName};
  });

// TODO: refactor to share code with `video-processing-service/src/firestore.ts`
const videoCollectionId = "videos";

export const getVideos = onCall({maxInstances: 1}, async () => {
  const querySnapshot =
  await firestore.collection(videoCollectionId).limit(10).get();
  return querySnapshot.docs.map((doc) => doc.data());
});

export const getVideo = onCall({maxInstances: 1}, async (request) => {
  const videoId = request.data.id;
  try {
    const docRef = firestore.collection(videoCollectionId).doc(videoId);
    const doc = await docRef.get();
    return doc.data();
  } catch (error) {
    throw new Error(`Fail Fetching the video: ${error}`);
  }
});

export const uploadVideoMetadata =
  onCall({maxInstances: 1}, async (request) => {
    const data = request.data;
    const metadata = {
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
    };
    firestore
      .collection(videoCollectionId)
      .doc(data.id)
      .set(metadata, {merge: true});

    logger.info(`Metadata added: ${JSON.stringify(metadata)}`);
    return;
  });
