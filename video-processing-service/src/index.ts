import express from 'express';
import ffmpeg from 'fluent-ffmpeg';
import {
    downloadRawVideo,
    uploadProcessedVideo,
    deleteRawVideo,
    deleteProcessedVideo,
    convertVideo,
    setupLocalDirectories
} from './storage-util';

// Create local directories for videos
setupLocalDirectories();

const app = express();
app.use(express.json());

// Process video file from Cloud Storage
app.post("/process-video", async (req, res) => {
    
    // Get data (filename) from Pub/Sub
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send('Bad request: missing filename.')
    }

    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;

    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);

    // Process the Video
    try {
        await convertVideo(inputFileName, outputFileName);
    } catch (error) {
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        return res.status(500).send('Processing failed')
    }

    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);
    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send('Processing finished successfully');
});

const port = process.env.PORT || 3000; // port 3000 as the fallback
app.listen(port, () => {
    console.log(`Server running at port ${port}`);
})