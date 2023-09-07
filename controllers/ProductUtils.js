const { getVisionClient } = require("./GoogleConfig");

//get vision client
const client = getVisionClient();

//Project Details
const projectId = process.env.GOOGLE_PROJECT_ID;
const location = process.env.GOOGLE_PROJECT_LOCATION;
const locationPath = client.locationPath(projectId, location);

//constants
const CATEGORY = {
    HOME: "homegoods-v2",
    FASHION: "apparel-v2",
    TOYS: "toys-v2",
    PACK: "packagedgoods-v1",
    GENERAL: "general-v1",
};

//method to create a new product set
const createProductSet = async (productSetId, productSetDisplayName) => {
    const productSet = {
        displayName: productSetDisplayName,
    };

    const request = {
        parent: locationPath,
        productSet: productSet,
        productSetId: productSetId,
    };

    const [createdProductSet] = await client.createProductSet(request);
    return createdProductSet;
};

//method to create a new product
const createProduct = async (
    productId,
    productDisplayName,
    productCategory,
    productDescription,
    productColor,
    productSize,
    productPrice
) => {

    const product = {
        displayName: productDisplayName,
        productCategory: productCategory,
        description: productDescription,
        productLabels: [
            {
                key: "color",
                value: productColor,
            },
            {
                key: "size",
                value: productSize,
            },
            {
                key: "price",
                value: productPrice,
            },
        ],
    };

    const request = {
        parent: locationPath,
        product: product,
        productId: productId,
    };

    const [createdProduct] = await client.createProduct(request);
    return createdProduct;
};

//method to add product to product set
const addProductToProductSet = async (productId, productSetId) => {
    const request = {
        name: client.productSetPath(projectId, location, productSetId),
        product: client.productPath(projectId, location, productId),
    };

    const [response] = await client.addProductToProductSet(request);
    return response;
};

//methods to update product
//update product name
const updateProductName = async (productId, productDisplayName) => {
    const product = {
        name: client.productPath(projectId, location, productId),
        displayName: productDisplayName,
    };

    const request = {
        product: product,
        updateMask: {
            paths: ["display_name"],
        },
    };

    const [updatedProduct] = await client.updateProduct(request);
    return updatedProduct;
};

//update product category
const updateProductCategory = async (productId, productCategory) => {
    const product = {
        name: client.productPath(projectId, location, productId),
        productCategory: productCategory,
    };

    const request = {
        product: product,
        updateMask: {
            paths: ["product_category"],
        },
    };

    const [updatedProduct] = await client.updateProduct(request);
    return updatedProduct;
};

//update product description
const updateProductDescription = async (productId, productDescription) => {
    const product = {
        name: client.productPath(projectId, location, productId),
        description: productDescription,
    };

    const request = {
        product: product,
        updateMask: {
            paths: ["description"],
        },
    };

    const [updatedProduct] = await client.updateProduct(request);
    return updatedProduct;
}; 

//update product labels
const updateProductLabels = async (productId, productColor, productSize, productPrice) => {
    const product = {
        name: client.productPath(projectId, location, productId),
        productLabels: [
            {
                key: "color",
                value: productColor,
            },
            {
                key: "size",
                value: productSize,
            },
            {
                key: "price",
                value: productPrice,
            },
        ],
    };

    const request = {
        product: product,
        updateMask: {
            paths: ["product_labels"],
        },
    };

    const [updatedProduct] = await client.updateProduct(request);
    return updatedProduct;
};

//method to delete product
const deleteProduct = async (productId) => {
    const request = {
        name: client.productPath(projectId, location, productId),
    };

    await client.deleteProduct(request);
    return("Product deleted successfully");
};

//method to delete product set
const deleteProductSet = async (productSetId) => {
    const request = {
        name: client.productSetPath(projectId, location, productSetId),
    };

    await client.deleteProductSet(request);
    return("Product set deleted successfully");
};

//method to delete product from product set
const deleteProductFromProductSet = async (productId, productSetId) => {
    const request = {
        name: client.productSetPath(projectId, location, productSetId),
        product: client.productPath(projectId, location, productId),
    };

    await client.removeProductFromProductSet(request);
    return("Product removed from product set successfully");
};

//method to list all product sets
const listProductSets = async () => {
    const request = {
        parent: locationPath,
    };

    const [response] = await client.listProductSets(request);
    return response;
};

//method to list all products
const listProducts = async () => {
    const request = {
        parent: locationPath,
    };

    const [response] = await client.listProducts(request);
    return response;
};

//method to list all products in a product set
const listProductsInProductSet = async (productSetId) => {
    const request = {
        name: client.productSetPath(projectId, location, productSetId),
    };

    const [response] = await client.listProductsInProductSet(request);
    return response;
};

//method to list all reference images of a product
const listReferenceImages = async (productId) => {
    const request = {
        parent: client.productPath(projectId, location, productId),
    };

    const [response] = await client.listReferenceImages(request);
    return response;
};

//method to get a single product
const getProduct = async (productId) => {
    const request = {
        name: client.productPath(projectId, location, productId),
    };

    const [response] = await client.getProduct(request);
    return response;
};

//method to add a product image
const addProductImage = async (productId, imageUri, imageId) => {
    const request = {
        parent: client.productPath(projectId, location, productId),
        referenceImage: {
            uri: imageUri,
        },
        referenceImageId: imageId,
    };

    const [response] = await client.createReferenceImage(request);
    return response;
};

//method to delete a product image
const deleteProductImage = async (productId, referenceImageId) => {
    const request = {
        parent: client.productPath(projectId, location, productId),
        referenceImageId: referenceImageId,
    };

    await client.deleteReferenceImage(request);
    return("Product image deleted successfully");
};

module.exports = {
    createProductSet,
    createProduct,
    addProductToProductSet,
    updateProductName,
    updateProductCategory,
    updateProductDescription,
    updateProductLabels,
    deleteProduct,
    deleteProductSet,
    deleteProductFromProductSet,
    listProductSets,
    listProducts,
    listProductsInProductSet,
    listReferenceImages,
    getProduct,
    addProductImage,
    deleteProductImage,
    CATEGORY,
};