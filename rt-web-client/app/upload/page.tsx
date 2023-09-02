'use client';

import React, { ChangeEvent, FormEvent, useState } from "react";
import styles from "./page.module.css";
import { uploadVideo } from "../utilities/firebase/functions";
import { useRouter } from "next/navigation";


export default function UploadForm() {
    const router = useRouter();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const handleVideoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.item(0);
        if (selectedFile) {
            setVideoFile(selectedFile);
        }
    };

    const handleImageFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.item(0);
        if (selectedFile) {
            setThumbnailFile(selectedFile);
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!videoFile) {
            alert(`Didn't found video file, try refreshing and choose the video again.`);
            return;
        }
        try {
            setUploading(true);
            await uploadVideo(videoFile, thumbnailFile, title, description);
            alert(`video uploaded successfully!`);
        } catch (error) {
            alert(`video upload failed: ${error}`);
        }

        // Redirect to Home
        router.push('/');
    };

    if (uploading) {
        return <h3> Uploading... </h3>
    }

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <div>
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    required
                    className={styles.input}
                />
            </div>
            <div>
                <label htmlFor="description">Description:</label> <br/>
                <textarea
                    id="description"
                    value={description}
                    onChange={handleDescriptionChange}
                    className={styles.input}
                />
            </div>
            <div>
                <label htmlFor="file">Upload File:</label>
                <input
                    type="file"
                    id="file"
                    onChange={handleVideoFileChange}
                    accept="video/*"
                    required
                    className={styles.input}
                />
            </div>
            <div>
                <label htmlFor="file">Upload Thumbnail(optional):</label>
                <input
                    type="file"
                    id="file"
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className={styles.input}
                />
            </div>
            <div>
                <button type="submit" className={styles.button}>
                    Upload
                </button>
            </div>
        </form>
    );
}
