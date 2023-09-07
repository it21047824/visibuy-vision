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

const router = require("express").Router();

//constants
const ID_PREFIX = "VP-";

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
router.route("/product").post(multermiddleware.fields([
    {name: "product", maxCount: 1},
    {name: "images", maxCount: 10},
]), async (req, res) => {

    const product = {...JSON.parse(req.body.product)};

    //get product details
    const productId = ID_PREFIX + String(product.name).replace(/\s/g, "-").toLowerCase();
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

    for (let i = 0; i < images.length; i++) {
        const file = images[i];
        await uploadFile(file).then(async (uri) => {
            //link image to product
            await addProductImage(productId, uri, "IMG-"+file.originalname);
        }).catch((err) => {
            console.log(err);
        });
    };

    res.json({message: "Product created successfully"});
});

//add product to product set
router.route("/productset/product").post((req, res) => {});

//update product
//update product name
router.route("/product/name").put((req, res) => {});

//update product category
router.route("/product/category").put((req, res) => {});

//update product description
router.route("/product/description").put((req, res) => {});

//update product labels
router.route("/product/labels").put((req, res) => {});

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
router.route("/productset/product").delete((req, res) => {});

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
router.route("/productset/product").get((req, res) => {});

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
