'use client';

import React, { ChangeEvent, FormEvent, useState } from "react";
import styles from "./page.module.css";
import { uploadVideo } from "../utilities/firebase/functions";
import { useRouter } from "next/navigation";


export default function UploadForm() {
    const router = useRouter();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.item(0);
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!file) {
            alert(`Didn't found file, try refreshing and choose the video again.`);
            return;
        }
        try {
            setUploading(true);
            await uploadVideo(file, title, description);
            alert(`video upload successfully!`);
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
                <label htmlFor="description">Description:</label> <br />
                <textarea
                    id="description"
                    value={description}
                    onChange={handleDescriptionChange}
                    required
                    className={styles.input}
                />
            </div>
            <div>
                <label htmlFor="file">Upload File:</label>
                <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    accept="video/*"
                    required
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
