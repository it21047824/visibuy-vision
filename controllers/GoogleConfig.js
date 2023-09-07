const { Storage } = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const path = require('path');

//constants
const GOOGLE_KEY= path.join(__dirname, `./${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

// Create a  new vision client
let visionClient;
// Create a  new storage client
let storageClient;

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

module.exports = { 
    getVisionClient,
    getStorageClient
 };