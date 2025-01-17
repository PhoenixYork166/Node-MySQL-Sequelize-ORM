const express = require('express');
const path = require('path');

// const rootDir = require('../util/path');
const shopController = require('../controllers/shop');

/* Import adminRoutes too for which routes/admin.js has products[] */
const router = express.Router();

/* Registering http://localhost:3005/ Express Router route for rendering rootDir/views/shop/index.ejs template */
router.get('/', shopController.getIndex);

/* Registering http://localhost:3005/products Express Router route for rendering rootDir/views/shop/project-list.ejs template */
router.get('/products', shopController.getProducts);

/* More specific Express Routes must stay upper than non-specific Express Routes 
e.g.
router.get('/products/delete', callback);
*/
router.post('/create-order', shopController.postOrder);

/* Registering http://localhost:3005/products/21243 Express Router route /products/randomId for rendering rootDir/views/shop/product-detail.ejs template */
router.get('/products/:productId', shopController.getProductDetail);

/* Registering http://localhost:3005/cart Express Router route */
router.get('/cart', shopController.getCart);

/* Registering http://localhost:3005/cart POST request handler for accepting product attributes to Shopping Cart */
router.post('/cart', shopController.postCart);

/* Registering http://localhost:3005/cart-delete-item POST request handler for deleting the specific product using productId */
router.post('/cart-delete-item', shopController.postCartDeleteProduct);

/* Registering http://localhost:3005/orders Express Router route */
router.get('/orders', shopController.getOrders);

/* Registering http://localhost:3005/checkout Express Router route */
router.get('/checkout', shopController.getCheckout);

module.exports = router;
