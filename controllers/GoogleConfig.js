const { Storage } = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const path = require('path');

//constants
const GOOGLE_KEY= path.join(__dirname, `./${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

// Create google vision client
let visionClient;
// Create cloud storage client
let storageClient;
//create image annotator client
let imageAnnotatorClient;

const getVisionClient = () => {
    if (!visionClient) {
        visionClient = new vision.ProductSearchClient({
            keyFilename: GOOGLE_KEY,
            projectId: process.env.GOOGLE_PROJECT_ID,
        });
    }
    return visionClient;
};

const getStorageClient = () => {
    if (!storageClient) {
        storageClient = new Storage({
            keyFilename: GOOGLE_KEY,
            projectId: process.env.GOOGLE_PROJECT_ID,
        });
    }
    return storageClient;
};

const getImageAnnotatorClient = () => {
    if (!imageAnnotatorClient) {
        imageAnnotatorClient = new vision.ImageAnnotatorClient({
            keyFilename: GOOGLE_KEY,
            projectId: process.env.GOOGLE_PROJECT_ID,
        });
    }
    return imageAnnotatorClient;
};

module.exports = { 
    getVisionClient,
    getStorageClient,
    getImageAnnotatorClient
 };