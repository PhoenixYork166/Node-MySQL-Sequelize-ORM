/* Import class Product from rootDir/models/product.js
to access Product.fetchAll() public static method
without instantiation */
// import Product from '../models/product';
const Product = require('../models/product');

/* 
Export a callback function to be used by 
router.get('/products', shopController.getProducts); in routes/shop.js 
for rendering rootDir/views/shop/product-list.ejs
*/
exports.getProducts = (req, res, next) => {
  const template = 'views/shop/product-list.ejs';
  const method = 'router.get';
  const route = 'http://localhost:3005/products';
  const callbackName = `rootDir/controllers/shop.js\nexports.getProducts: RequestHandler = (req, res, next) => {}\n`;
  console.log(`\nHosting of ${template}\nthrough ${method} is in progress\nfor ${route}\ncallbackName:\n${callbackName}`);

  Product.findAll()
  .then(products => {
    res.render('shop/product-list', {
      path: req.url ? req.url : '/products',
      pageTitle: 'All Products',
      prods: products
    });
  })
  .catch((err) => {
    console.log(`\nError for ${callbackName}\n${err}\n`);
  });
};

/* 
Export a callback function to be used by 
router.get('/products/:productId', shopController.getProductDetail); in routes/shop.js 
for rendering rootDir/views/product-detail.ejs template via
http://localhost:3005/products/productUniqueId
*/
exports.getProductDetail = (req, res, next) => {
  /* Extracting product Id using Server-side V8 Engine built-in req.params method 
  We can access productId here cuz we use productId as a param inside rootDir/routes/shop.js
  */
  const prodId = req.params.productId;

  const route = `http://localhost:3005/products/${prodId}`;
  const template = 'rootDir/views/shop/product-detail.ejs';
  const callbackName = `rootDir/controllers/shop.js\nexports.getProductDetail: RequestHandler = (req, res, next) => {}\n`;
  console.log(`${route}\nis up\nproductId: ${prodId}\nTemplate:\n${template}\ncallbackName:\n${callbackName}`);
  
  /* sequelize.findById() has deprecated !!
  sequelize.findByPk(prodId) instead!! */
  // Approach1 - Product.findAll({where: {key: keyValue}}) 
  // Product.findAll({where: {id: prodId}})
  // .then((products)=>{
  //   console.log(`Product.findAll({where: {id: prodId}}):\nproducts[0]`);
  //   console.log(products[0]);

  //   /* Rendering rootDir/views/shop/product-detail.ejs view */
  //   res.render('shop/product-detail', {
  //     product: products[0],
  //     pageTitle: products[0].title,
  //     path: req.url ? req.url : '/products'
  //   })
  // })
  // .catch((err) => console.log(`Err Product.findAll({where: {id: prodId}}):\n${err})`));

  // Approach2 - Product.findByPk(prodId)
  Product.findByPk(prodId)
  .then((eachProduct) => {
      console.log(`\nProduct.findByPk(${prodId})\n.then((eachProduct) => {...}\n:`);
      console.log(eachProduct);
      console.log(`\n`);

      /* Rendering rootDir/views/shop/product-detail.ejs view */
      res.render('shop/product-detail', {
        product: eachProduct,
        pageTitle: eachProduct.title,
        path: req.url ? req.url : '/products'
      })
    }
  )
  .catch(err => console.log(`\nError for ${callbackName}\n${err}\n`));  
};

/* 
Export a callback function to be used by 
router.get('/', shopController.getIndex); in routes/shop.js 
for rendering rootDir/views/shop/index.ejs
*/
exports.getIndex = (req, res, next) => {
  const template = 'views/shop/index.ejs';
  const route = 'http://localhost:3005/';
  const method = 'router.get';
  const callbackName = `rootDir/controllers/shop.js\nexports.getIndex: RequestHandler = (req, res, next) => {}\n`;
  console.log(`\nHosting of ${template}\nthrough ${method} is in progress\non route:\n${route}\n`);

  /* Using Sequelize connector */
  Product.findAll()
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  })
  .catch((err) => {
    console.log(`\nError occurred:\n${err}\nWhen rendering ${template}\non route \n${route}\ncallbackName:\n${callbackName}`);
  });
};

/* 
Export a callback function to be used by 
router.get('/cart', shopController.getCart); in routes/shop.js 
for rendering rootDir/views/shop/cart.ejs 
*/
exports.getCart = (req, res, next) => {
  const template = `views/shop/cart.ejs`;
  const route = `http://localhost:3005/cart`;
  const method = `router.get`;
  console.log(`\nHosting of ${template} through ${method} is in progress\n${route}\n`);

  req.user.getCart()
  .then((retrievedCart) => {
    if (!retrievedCart) {
      console.error(`\nFailed req.user.getCart()\nRedirecting to /\n`);
      return res.status(303).redirect(303, "/");
    } else {
      return retrievedCart.getProducts()
      .then((products) => {
        res.render('shop/cart', {
          products: products,
          pageTitle: 'Your Cart',
          path: req.url ? req.url : `/cart`
        })
      })
      .catch(err => console.log(err));
    }
  })
  .catch((err) => {
    console.log(`\nFailed getCart:\nCart.getCart({ where: {req.user.id: ${req.user.id} })\n${route}\nError logging:\n${err}\n`)
  });
};

/* 
Export a callback function to be used by 
router.post('/cart', ); in routes/shop.js
for Accepting product attributes as req.body.fields via POST request 
*/
exports.postCart = (req, res, next) => {
  /* req.body.productId because rootDir/views/shop/product-detail.ejs <input type="hidden" name="productId" value="<%= product.id %>"> */
  const prodId = req.body.productId;
  const requestQuantity = parseInt(req.body.quantity);
  let fetchedCart;
  let newQuantity = 1;
  const method = `router.post`;
  const route = `http://localhost:3005/cart`;
  const callbackName = `\nrootDir/controllers/shop.js\nexports.postCart: RequestHandler = (req, res, next) => {}\n`;
  console.log(`\nMethod: ${method} to\n${route} for adding an item to cart\n${callbackName}\n`);
  
  /* Accessing Cart using Magic method */
  req.user
    .getCart()
    .then((retrievedCart) => {
      fetchedCart = retrievedCart; // hoisting req.user.getCart() result to global fetchedCart
      // Check whether request product is already in Cart; yes => qty++; no => qty: 1
      return retrievedCart.getProducts( { where: { id: prodId } });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      } 
    
      if (product) { // if this is an existing item in Cart
        const prevQuantity = product.cartItem.quantity;
        newQuantity = +prevQuantity + +requestQuantity;
        return product;
      }
      return Product.findByPk(prodId) // Otherwise, this is a new product in Cart
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity }
      });
    })
    .then(() => {
      res.status(301).redirect('/cart');
    })
    .catch((err) => {
      console.log(`\nError for ${callbackName}: ${err}\n`);
    });
};

/*
Export a callback function to be used by routes/shop.js for deleting
a specific product inside Cart */
exports.postCartDeleteProduct = (req, res, next) => {
  /* Retrieving request.body.productId sent from frontend */
  const prodId = req.body.productId;

  /* i. Using Magic method req.user.method() */
  req.user.getCart()
  .then((retrievedCart) => {
    // ii. retrievedCart is an object of products [{key1: keyValue1}, {key2: keyValue2}, {...}]
    // return this retrievedCart object to next Promise by:
    return retrievedCart.getProducts({
      where: { id: prodId }
    });
  })
  // iii. receiving products{} from previous Promise
  .then((products) => {
    if (!products || products.length === 0) {
      res.status(404).send(`Product is not found in cart\n`);
    }
    // Map out the desired product{} which is 1st product{} inside products[{},{}]
    const product = products[0];
    // Having mapped out the desired product{} Sequelize provides us with a default implemenation product.cartItem property which has .destroy() method to delete a specific product
    // v. Finish this Promise-chain off using Magic method by returning something
    return product.cartItem.destroy();
  })
  .then((result) => {
    // vi. Having received a successful result => redirect page to '/cart'
    res.status(200).redirect('/cart');
  })
  .catch((err) => {
    console.log(`\nError for ${callbackName}: ${err}\n`);
    res.status(400).json({ error: `Unable to POST Cart Items to Order`, details: err.toString() });
  });
};

/*
Export a callback function to move table CartItems to table OrderItems
*/
exports.postOrder = (req, res, next) => {
  const route = `http://localhost:3005/create-order`;
  let fetchedCart;

  /* Using Magic method to access currently logged-in user cart */
  req.user.getCart()
  .then(retrievedCart => {
    // once we successfully retrieve a Cart => Hoist to this callback scope
    fetchedCart = retrievedCart;
    return retrievedCart.getProducts()
  })
  .then(products => {
    console.log(`${route}\nproducts:\n`);
    console.log(products);
    return req.user.createOrder()
    .then(order => {
        // adding each product in cart with respective quantity
        return order.addProducts(
          products.map(eachProduct => {
            eachProduct.orderItem = { quantity: eachProduct.cartItem.quantity };
          return eachProduct;
          })
        );
    })
    .then(result => {
      /* Clean up Cart 
      Resetting Cart after order.addProducts(products.map(eachProduct => { eachProduct.orderItem = { quantity: eachProduct.cartItem.quantity }; return eachProduct; }) )
      */
      return fetchedCart.setProducts(null);
    })
    .then(result => {
      // Finally redirectly the page back to /orders
      res.status(200).redirect('/orders');
    })
    .catch(err => {
      console.log(`\nError posting Cart Items to Order: ${err}\n`);
    });
  })
  .catch(err => {
    console.log(`\n${route}\nError retrieving current user's cart: ${err}\n`);
  })
};

/* 
Export a callback function to be used by routes/shop.js for 
rendering rootDir/views/shop/orders.ejs
*/
exports.getOrders = (req, res, next) => {
  const template = `rootDir/views/shop/orders.ejs`;
  const method = 'router.get';
  const route = `http://localhost:3005/orders`;
  const callbackName = `rootDir/controllers/shop.js\nexports.getOrders: RequestHandler = (req, res, next) => {}\n`;
  console.log(`Hosting of ${template}\nthrough ${method} is in progress\nfor ${route}\n`);
  
  /* Magic method .getOrders() to retrieve currently logged-in user's Orders */
  /* Using 'Eager Loading' technique provided by Sequelize
  ({ include: ['products'] }) because of 
  Associations in app.js
  Order.belongsToMany(Product, { through: OrderItem });
  */
  req.user.getOrders({ include: ['products'] })
  .then(orders => {
    console.log(`${callbackName}\norders:`);
    console.log(orders);

    res.render('shop/orders', {
      path: req.url ? req.url : '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    })
  })
  .catch(err => {
    console.log(`\n${route}\nError retrieving current user's Order: ${err}\n`);
  });  
};

/* 
Export a callback function to be used by routes/shop.js for 
rendering rootDir/views/shop/checkout.ejs
*/
exports.getCheckout = (req, res, next) => {
  console.log(`Hosting of views/shop/checkout.ejs through router.get is in progress\nfor http://localhost:3005/checkout\n`);
  /*
    Main Node rootDir/app.js implements EJS Templating Engine
    app.set('view engine', 'ejs');
    within this module => res.render() EJS templates
    rendering rootDir/views/shop/checkout.ejs template
  */
  res.render('shop/cart', {
    path: req.url ? req.url : '/checkout',
    pageTitle: 'Checkout',
  })
};
