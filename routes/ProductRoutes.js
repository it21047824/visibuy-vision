const {
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
} = require("../controllers/ProductUtils");
const { uploadFile, downloadFile, deleteFile } = require("../controllers/StorageUtils");
const multermiddleware = require("../middleware/Multer");
const axios = require("axios");

const router = require("express").Router();

//constants
const ID_PREFIX = "VP-";
const BASE_URL = 'https://visibuyapp-e9453e5950ca.herokuapp.com'

//create new product set
router.route("/productset").post((req, res) => {
    //call createProductSet method
    const productSetId =
        ID_PREFIX +
        String(req.body.productSetDisplayName)
            .replace(/\s/g, "-")
            .toLowerCase();
    const productSetDisplayName = req.body.productSetDisplayName;

    createProductSet(productSetId, productSetDisplayName)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json(err);
        });
});

//create new product
router.route("/product")
.post(multermiddleware.fields([
    {name: "product", maxCount: 1},
    {name: "images", maxCount: 10},
]), async (req, res) => {
    const product = { ...JSON.parse(req.body.product) };

    //get product details
    const productId =
        ID_PREFIX + String(product.name).replace(/\s/g, "-").toLowerCase();
    const productDisplayName = product.name;
    const productCategory = product.category;
    const productDescription = product.description;
    const productColor = product.color;
    const productSize = product.size;
    const productPrice = product.price;

    //create the product in vision product search
    const createdProduct = await createProduct(
        productId,
        productDisplayName,
        productCategory,
        productDescription,
        productColor,
        productSize,
        productPrice
    );

    //upload images to cloud storage
    const images = req.files.images;
    
    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
        const file = images[i];
        await uploadFile(file)
            .then(async (uri) => {
                //add to imageUrls
                imageUrls.push(uri);

                //link image to product
                const res_img = await addProductImage(
                    productId,
                    uri,
                    "IMG-" + file.originalname
                );
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const dbProduct = {
        user: '641aaee2b8ed930c6e7186c1',
        name: createdProduct.displayName,
        images: imageUrls.map((url) => {return {url: url}}),
        category: productCategory,
        brand: String(productDisplayName).split(" ")[0],
        description: productDescription,
        price: productPrice,
        countInStock: 10,
    }

    //save product in DB
    const dbres = await axios.post(`${BASE_URL}/api/v1/products`, dbProduct)

    if (dbres.data) {
        res.json({message: "Product added successfully"});
    }
})
//update product
.put(multermiddleware.fields([
    {name: "product", maxCount: 1},
    {name: "images", maxCount: 10},
]), async (req, res) => {
    const product = { ...JSON.parse(req.body.product) };

    //get product details
    const productId =
        ID_PREFIX + String(product.name).replace(/\s/g, "-").toLowerCase();
    const productDisplayName = product.name;
    const productCategory = product.category;
    const productDescription = product.description;
    const productColor = product.color;
    const productSize = product.size;
    const productPrice = product.price;

    //update the product in vision product search

    try {
        if (productDisplayName) {
            const res_name = await updateProductName(
                productId,
                productDisplayName
            );
        }

        if (productCategory) {
            const res_category = await updateProductCategory(
                productId,
                productCategory
            );
        }

        if (productDescription) {
            const res_desc = await updateProductDescription(
                productId,
                productDescription
            );
        }

        if (productColor || productSize || productPrice) {
            const res_labels = await updateProductLabels(
                productId,
                productColor,
                productSize,
                productPrice
            );
        }

        if (req.files?.images?.length > 0) {
            //upload images to cloud storage
            const images = req.files.images;

            for (let i = 0; i < images.length; i++) {
                const file = images[i];
                await uploadFile(file)
                    .then(async (uri) => {
                        //link image to product
                        const res_img = await addProductImage(
                            productId,
                            uri,
                            "IMG-" + file.originalname
                        );
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
        res.json({message: "Product updated successfully"});
    } catch (error) {
        res.json({ error: error });
    }
});

//add product to product set
router.route("/productset/product").post(async (req, res) => {

    const productSetId = req.body.productSetId;
    const productIdList = req.body.productIdList;

    let result = [];
    let error;

    for (let i = 0; i < productIdList.length; i++) {
        const productId = productIdList[i];
        await addProductToProductSet(productId, productSetId)
            .then((response) => {
                result.push(response);
            })
            .catch((err) => {
                console.debug(err);
                error = err;
            });
    }
    
    if (error) {
        res.json(error);
    } else {
        res.json(result);
    }
});


//update product name
// router.route("/product").put((req, res) => {});

//update product category
// router.route("/product/category").put((req, res) => {});

//update product description
// router.route("/product/description").put((req, res) => {});

//update product labels
// router.route("/product/labels").put((req, res) => {});

//delete product
router.route("/product/:productName").delete(async (req, res) => {
    //call deleteProduct method
    const productId = req.params.productName;

    //get a list of images of the product
    const images = await listReferenceImages(productId);

    const result = await deleteProduct(productId);
    console.log("Deleted product : " + productId);

    if (images.length > 0) {
        //delete all images from cloud storage
        for (let i = 0; i < images.length; i++) {
            const fileName = String(images[i].uri).split("/")[3];
            await deleteFile(fileName).then(() => {
                console.log("Deleted file : " + fileName);
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    res.json({ message: result });
});

//delete product set
router.route("/productset/:productSetDisplayName").delete((req, res) => {
    //call deleteProductSet method
    const productSetId = req.params.productSetDisplayName;

    deleteProductSet(productSetId)
        .then((response) => {
            res.json({message: response});
        })
        .catch((err) => {
            res.json(err);
        });
});

//delete product from product set
router.route("/:productset/:product").delete(async (req, res) => {
    //call deleteProductFromProductSet method
    const productId = req.params.product;
    const productSetId = req.params.productset;

    await deleteProductFromProductSet(productId, productSetId)
        .then((response) => {
            res.json({message: response});
        })
        .catch((err) => {
            res.json(err);
        });
});

//get all product sets
router.route("/productset").get(async (req, res) => {
    //call listProductSets method
    await listProductSets()
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json(err);
        });
});

//get all products
router.route("/product").get((req, res) => {
    listProducts()
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json(err);
        });
});

//get all products in product set
router.route("/productset/:productSetId").get(async (req, res) => {
    const productSetId = req.params.productSetId;

    //call listProductsInProductSet method
    await listProductsInProductSet(productSetId)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json(err);
        });
});

//get all reference images of a product
router.route("/product/:productID/referenceimage").get((req, res) => {
    //call listReferenceImages method
    const productId = req.params.productID;

    listReferenceImages(productId)
        .then((response) => {
            res.json(response);
        })
        .catch((err) => {
            res.json(err);
        });
});

//get a single product
router.route("/singleproduct").get((req, res) => {});

//add product image
router.route("/product/referenceimage").post((req, res) => {});

//delete product image
router.route("/product/referenceimage").delete((req, res) => {});

module.exports = router;
