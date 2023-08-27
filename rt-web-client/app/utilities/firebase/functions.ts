import {httpsCallable} from "firebase/functions";
import {functions} from "./firebase"
import Video from "@/app/interfaces/Video";


const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl');
const getVideosFunction = httpsCallable(functions, 'getVideos');
const getVideoFunction = httpsCallable(functions, 'getVideo');

export async function uploadVideo(file: File) {
    const response: any = await generateUploadUrl({
        fileExtension: file.name.split('.').pop()
    });

    // Upload the file with the signed URL
    await fetch(response?.data?.url, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type
        }
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