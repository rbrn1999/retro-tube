import {httpsCallable} from "firebase/functions";
import {functions} from "./firebase"
import Video from "@/app/interfaces/Video";


const generateUploadVideoUrl = httpsCallable(functions, 'generateUploadVideoUrl');
const generateUploadThumbnailUrl = httpsCallable(functions, 'generateUploadThumbnailUrl');
const getVideosFunction = httpsCallable(functions, 'getVideos');
const getVideoFunction = httpsCallable(functions, 'getVideo');
const uploadVideoMetadata = httpsCallable(functions, 'uploadVideoMetadata');

export async function uploadVideo(video: File, thumbnail: File | null, title: String, description: String) {
    const videoUrlResponse: any = await generateUploadVideoUrl({
        fileExtension: video.name.split('.').pop()
    });
    const id = videoUrlResponse?.data?.fileName.split('.')[0];
    let thumbnailUrlResponse: any = {}
    if (thumbnail) {
        thumbnailUrlResponse = await generateUploadThumbnailUrl({id: id, fileExtension: thumbnail.name.split('.').pop()})
    }

    // Upload the file with the signed URL
    await Promise.all([
        fetch(videoUrlResponse?.data?.url, {
            method: 'PUT',
            body: video,
            headers: {
                'Content-Type': video.type
            }
        }),
        thumbnail ? fetch(thumbnailUrlResponse?.data?.url, {
            method: 'PUT',
            body: thumbnail,
            headers: {
                'Content-Type': thumbnail.type,
                'x-goog-acl': 'public-read'
            }
        }) : Promise.resolve() // solve dummy promise when there's no thumbnail
    ])
    uploadVideoMetadata({
        id: id,
        title: title,
        description: description,
        thumbnail: thumbnailUrlResponse?.data?.fileName
    });
    return;
}

export async function getVideos() {
    const response: any = await getVideosFunction();
    return response.data as Video[];
}

export async function getVideo(id: string) {
    const response: any = await getVideoFunction({id: id})
    return response.data as Video;
}