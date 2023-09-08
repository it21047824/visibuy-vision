const { searchSimilarProducts } = require("../controllers/SearchUtils");
const multermiddleware = require("../middleware/Multer");

const router = require("express").Router();

//constants
const CATEGORY = {
    HOME: "homegoods-v2",
    FASHION: "apparel-v2",
    TOYS: "toys-v2",
    PACK: "packagedgoods-v1",
    GENERAL: "general-v1",
};

const SEARCH_BUCKET = "visibuy-search-images";

router.route("/search").post(async (req, res) => {
        const {
            productSetId,
            productCategory,
            filter,
            cloudLink,
            image
        } = req.body;
        
        let content;

        if (!cloudLink) {
            try {
                content = new Buffer.from(
                    image.base64.replace(/^data:image\/\w+;base64,/, ""),
                    "base64"
                );
            } catch (error) {
                content = null;
            }
        } else {
            content = image;
        }

        if(!content) {
            res.json({error:{message: "Image Error : select a different image"}});
            return;
        }

        let productCategories = productCategory
            ? [productCategory]
            : [
                  CATEGORY.GENERAL,
                  CATEGORY.HOME,
                  CATEGORY.FASHION,
                  CATEGORY.TOYS,
                  CATEGORY.PACK,
              ];

        let searchFiler = filter ? filter : "";

        //call searchSimilarProducts method
        await searchSimilarProducts(
            productSetId,
            productCategories,
            content,
            cloudLink || false,
            searchFiler
        )
            .then((response) => {
                res.json(response);
            })
            .catch((err) => {
                res.json(err);
            });
    }
);

module.exports = router;
