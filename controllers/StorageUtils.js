const { getStorageClient } = require('./GoogleConfig');

//constants
const BUCKET_NAME = process.env.GOOGLE_BUCKET_NAME;

//get storage client
const client = getStorageClient();

const uploadFile = async (file) => new Promise((resolve, reject) => {
    const bucket = client.bucket(BUCKET_NAME);
    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream({
        resumable: true,
    });

    blobStream.on('error', (err) => {
        reject(err);
    });

    blobStream.on('finish', () => {
        const publicUrl = `gs://${bucket.name}/${blob.name}`;
        resolve(publicUrl);
    });

    blobStream.end(file.buffer);
});

const deleteFile = async (filename) => new Promise((resolve, reject) => {
    const bucket = client.bucket(BUCKET_NAME);
    const blob = bucket.file(filename);

    blob.delete().then(() => {
        resolve();
    }).catch((err) => {
        reject(err);
    });
});

const downloadFile = async (filename) => new Promise((resolve, reject) => {
    const bucket = client.bucket(BUCKET_NAME);
    const blob = bucket.file(filename);

    blob.download().then((data) => {
        resolve(data);
    }).catch((err) => {
        reject(err);
    });
});

module.exports = {
    uploadFile,
    deleteFile,
    downloadFile
};