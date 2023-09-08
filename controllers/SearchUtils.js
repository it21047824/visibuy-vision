const { getVisionClient, getImageAnnotatorClient } = require("./GoogleConfig");
const fs = require("fs");

const visionClient = getVisionClient();
const imageAnnotatorClient = getImageAnnotatorClient();

const searchSimilarProducts = async (
    productSetId,
    productCategories,
    filePath,
    cloudLink,
    filter
) =>
    new Promise(async (resolve, reject) => {
        const projectId = process.env.GOOGLE_PROJECT_ID;
        const location = process.env.GOOGLE_PROJECT_LOCATION;

        const productSetPath = visionClient.productSetPath(
            projectId,
            location,
            productSetId
        );

        let image; //fs.readFileSync(filePath, "base64");

        if(cloudLink) {
            image = {source: {imageUri: filePath}};
        } else {
            image = {content:filePath};
        }

        const request = {
            image: image,
            features: [{ type: "PRODUCT_SEARCH" }],
            imageContext: {
                productSearchParams: {
                    productSet: productSetPath,
                    productCategories: [...productCategories],
                    filter: filter,
                },
            },
        };

        const [response] = await imageAnnotatorClient.batchAnnotateImages({
            requests: [request],
        });

        try {
            const results =
            response["responses"][0]["productSearchResults"]["results"];

            if(results.length === 0) {
                reject({error:{message: "No similar products found"}});
            } else {
                resolve(results);
            }
        } catch (err) {
            reject({error:{message: "No similar products found"}});
        }
    });

module.exports = { searchSimilarProducts };
