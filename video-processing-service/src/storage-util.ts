import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = "retro-tube-raw-videos";
const processedVideoBucketName = "retro-tube-processed-videos";

const localRawVideoPath = "./raw-videos"
const localProcessedVideoPath = "./processed-videos"

/**
 * Creates local directories for raw and processed videos.
 */
export function setupLocalDirectories() {
    ensureDirectoryExistence(localRawVideoPath)
    ensureDirectoryExistence(localProcessedVideoPath);
}

/**
 * 
 * @param rawVideoName - File name of the raw video to be processed.
 * @param processedVideoName - File name of the processed video converted from the raw video.
 * @returns A promise that resolves when video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    // ffmpeg video processing 
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
            .outputOptions('-vf', 'scale=-1:360, format=gray') // 360p and grayscale
            .on("end", () => {
                console.log("Processing finished successfully.")
                resolve();
            })
            .on("error", (error: any) => {
                console.log(`An error occurred: ${error.message}`);
                reject(error);
            })
            .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

/**
 * 
 * @param fileName - The file name of the video to download in the {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({
            destination: `${localProcessedVideoPath}/${fileName}`
        });
    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localProcessedVideoPath}/${fileName}.`)
}

/**
 * 
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    // Upload video to bucket
    await storage.bucket(processedVideoBucketName)
        .upload(`${localProcessedVideoPath}/${fileName}`, { destination: fileName });
    await bucket.file(fileName).makePublic();

    console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs//:${processedVideoBucketName}/${fileName}`);
}

/**
 * 
 * @param fileName - The name of the file to delete from the 
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteRawVideo(fileName: string): Promise<void> {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * 
 * @param fileName - The name of the file to delete from the 
 * {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(fileName: string): Promise<void> {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * 
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => { 
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (error) => {
                if (error) {
                    console.error(`Fail to delete file at ${filePath}`, error);
                    reject(error);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            });
        } else {
            console.log(`File not found at ${filePath}, skipping delete.`)
            resolve();
        }
    });
}

/**
 * 
 * @param dirPath - directory to ensure existence
 * If dirPath doesn't exist already, create the folders.
 */
function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directory created at ${dirPath}`)
    }
}
