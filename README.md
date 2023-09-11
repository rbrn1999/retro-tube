# RetroTube
Full online video service with account login, video upload, video processing, video watching, built with GCP. \
Other framework or tool used: ffmpeg, ExpressJS, NextJS.

## Demo
[Web-Client-Demo.md](./demo/Web-Client-Demo.md)

## Requirements
Docker \
Initialized Google Cloud project \
gcloud cli \
firebase cli (`npm install -g firebase-tools`) \
Set the firebase config in `rt-web-client/app/utilities/firebase/firebaseConfig.ts` 

## Deploy
### Video Processing Service
`video-processing-service/`
1. Create Artifact Registry repository (with cli or web UI): 
```
$ gcloud artifacts repositories create video-processing-repo \
  --repository-format=docker \
  --location=<REGION> \
  --description="Docker repository for video processing service"
```
2. Build the Docker image:  `docker build --platform linux/amd64 -t <REGION>-docker.pkg.dev/<PROJECT_ID>/video-processing-repo/video-processing-service .`
3. Make sure to authenticate Docker with gcloud: `gcloud auth configure-docker <REGION>-docker.pkg.dev`
4. Push to GCP repo: `docker push <REGION>-docker.pkg.dev/<PROJECT_ID>/video-processing-repo/video-processing-service`
5. Deploy to Cloud Run, change the config for your needs (with cli or web UI):
```
gcloud run deploy video-processing-service --image <REGION>-docker.pkg.dev/PROJECT_ID/video-processing-repo/video-processing-service \
  --region=<REGION> \
  --platform managed \
  --timeout=3600 \
  --memory=2Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=2 \
  --ingress=internal

```
### Cloud Storage Buckets
1. Create raw videos bucket: \
`gsutil mb -l <REGION> --pap=enforced gs://<BUCKET_NAME>`
2. Create raw videos bucket: \
`gsutil mb -l <REGION> gs://<BUCKET_NAME>`
3. Create thumbnail bucket: \
`gsutil mb -l <REGION> gs://<BUCKET_NAME>`

### Pub/Sub
Use Pub/Sub to notify video-processing-service a new video is uploaded to our bucket.
1. Create Pub/Sub topic: \
`gcloud pubsub topics create <TOPIC_NAME>`
2. Create Pub/Sub subscription (SERVICE_URL=video-processing-service Cloud Run endpoint URL):
```
gcloud pubsub subscriptions create SUBSCRIPTION_NAME \
  --topic=TOPIC_NAME \
  --push-endpoint=SERVICE_URL \
  --ack-deadline=600
```
3. Link raw video bucket to this pubsub topic: \
`gsutil notification create -t <topic-name> -f json -e OBJECT_FINALIZE gs://<BUCKET_NAME>`

### Backend API (Firebase Functions)
`./rt-api-service/functions`
1. Deploy functions:
```
npm install
firebase deploy --only functions:<FUNCTION_NAME>
```
2. In the `raw video bucket`, grant access to `createUser` firebase function's `service account` <br> (Permissions -> Grant Access -> principles: the `service account`, role: "Cloud Storage > Storage Object Admin")

3. Add `Service Account Token Creator` for `generateUploadVideoUrl`, `generateUploadThumbnailUrl` function's service account: <br> In the GCP IAM page add another role: `Service Account Token Creator` for the `service account` (Could use the same service account for simplicity). 

### Web Client (NextJS)
`./rt-web-client`
1. Change the bucket name and URL prefix in `app/page.tsx`, `app/watch/page.tsx` and `next.config.js`.
2. Create a Artifact Registry repo (with cli or web UI)
    ```
    gcloud artifacts repositories create rt-web-client-repo \
    --repository-format=docker \
    --location=<REGION> \
    --description="Docker repository for the web client"
    ```
3. Build the Docker image:  `docker build --platform linux/amd64 -t <REGION>-docker.pkg.dev/<PROJECT_ID>/rt-web-client-repo/rt-web-client .`
4. Push to GCP repo: `docker push <REGION>-docker.pkg.dev/<PROJECT_ID>/rt-web-client-repo/rt-web-client`
5. Deploy to Cloud Run (with cli or web UI)
    ```
    gcloud run deploy rt-web-client --image <REGION>-docker.pkg.dev/<PROJECT_ID>/rt-web-client-repo/rt-web-client \
    --region=<REGION> \
    --platform managed \
    --timeout=3600 \
    --memory=2Gi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=1
    ```
6. In Firebase Auth, add the Cloud Run URL of the web-client to authorized domains.
7. Update the CORS configuration for cloud buckets to upload file properly. `gcloud storage buckets update gs://<BUCKET_NAME> --cors-file=utils/gcs-cors.json` <br/> Apply  "responseHeader":  "x-goog-acl" for the thumbnail bucket.


## Reference
Firebase CLI - https://firebase.google.com/docs/functions/get-started?authuser=0&gen=2nd#set-up-your-environment-and-the-firebase-cli \
Firebase Admin SDK - https://firebase.google.com/docs/admin/setup \
Firebase Call functions from your app - https://firebase.google.com/docs/functions/callable \
Signed URLs: https://cloud.google.com/storage/docs/access-control/signed-urls \
Create Signed URL: https://cloud.google.com/storage/docs/samples/storage-generate-upload-signed-url-v4#storage_generate_upload_signed_url_v4-nodejs \
Set the CORS configuration on a bucket: https://cloud.google.com/storage/docs/using-cors#configure-cors-bucket

## Acknowledgement
This project is based on and inspired by NeedCode's "Full Stack Development" course.

