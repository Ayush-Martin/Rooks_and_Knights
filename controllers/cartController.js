//services
const cartServices = require('../services/cartServices')

//render cartpage
exports.getCart = async (req, res) => {
    try {
        let cart = await cartServices.viewCart(req.userID)

        res.render('cart', { cart })
    } catch (err) {
        console.log(err);
        res.redirect('/error')
    }
}

//adding a new product to cart
exports.addToCart = async (req, res) => {
    try {
        const productID = req.params.id;
        const { quantity, categoryID, subCategoryID } = req.body;
        
        const userID = req.userID;

        const error = await cartServices.addToCart(userID, productID, quantity, categoryID, subCategoryID)
        if (error && error.error) {
            return res.status(200).json({ error: error.error, errorRedirect: `<a href="/cart">Check cart</a>` })
        }

        res.status(200).json({ success: true })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}

//delete cart
exports.deleteCartItem = async (req, res) => {
    try {
        const cartItemID = req.params.id;
        await cartServices.deleteCartItem(cartItemID, req.userID)

        res.status(200).json({ success: true })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}

//update cart product quantity
exports.putUpdateCart = async (req, res) => {
    try {
        const { cartItems, totalPrice } = req.body;
        await cartServices.updateCart(cartItems, totalPrice, req.userID);

        res.status(200).json({ success: true })
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" })
    }
}