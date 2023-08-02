import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express();
app.use(express.json());

app.post("/process-video", (req, res) => {
    // define file path
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath

    // validate request
    if (!inputFilePath) {
        res.status(400).send("Bad Request: Missing Input File Path")
    }
    if (!outputFilePath) {
        res.status(400).send("Bad Request: Missing Output File Path")
    }

    // ffmpeg video processing 
    ffmpeg(inputFilePath)
        .outputOptions('-vf', 'scale=-1:360, format=gray') // 360p and grayscale
        .on("end", () => {
            res.status(200).send("Processing finished successfully.")
        })
        .on("error", (error) => {
            console.log(`An error occurred: ${error.message}`);
            res.status(500).send(`Internal Server Error: ${error.message}`)
        })
        .save(outputFilePath);
});

const port = process.env.PORT || 3000; // port 3000 as the fallback
app.listen(port, () => {
    console.log(`Server running at port ${port}`);
})