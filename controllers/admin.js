const Product = require("../models/product");

/* 
For GET request to http://localhost:3005/admin/add-product route
Export a callback function to be used by routes/admin.js for 
rendering rootDir/views/admin/edit-product.ejs
*/
exports.getAddProduct = (req, res, next) => {
  console.log(
    `Hosting views/admin/edit-product.ejs through router.get\nfor http://localhost:3005/admin/add-product\n`
  );

  res.render("admin/edit-product", {
    path: req.url ? req.url : "/admin/add-product",
    pageTitle: "Add Product",
    editing: false,
  });
};

/* 
For POST request to http://localhost:3005/admin/add-product route 
Export a callback function to be used by routes/admin.js for 
storing users input 'new product item' to data/products.json
*/
exports.postAddProduct = (req, res, next) => {
  const route = 'http://localhost:3005/admin/add-product';
  const callbackName = `rootDir/controllers/admin.js\nexports.postAddProduct: RequestHandler = (req, res, next) => {}\n`;
  console.log(`Hosting POST request handler for ${route}\nNode API is in progress\n`);

  /* Best Practice to use ES6 Object Destructuring to destructure parameters from Browser req.body.params for easier implementation */
  const { title, price, description, imageUrl } = req.body;

  console.log(`Just received a POST request from\n${route}\n{ "req.body.title": ${title}, "req.body.price": ${price}, "req.body.description": ${description}, "req.body.imageUrl": ${imageUrl} }\n`);

  /* // Sequelize official docs 'create' method to immediately save an item into MySQL https://sequelize.org/docs/v6/core-concepts/model-instances/ */
  Product.create({
    /* id is automatically incremental */
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
  })
  .then((result) => {
    console.log(`\n${route}\ncallbackName:\n${callbackName}\nOK! result:`);
    console.log(result);
  })
  .catch((err) => {
    console.log(`\n${route}\ncallbackName:\n${callbackName}\nError:\n${err}\n`);
  });
};

/*
For GET request to http://localhost:3005/admin/edit-product/:productId route
Export a callback function to be used by routes/admin.js for
rendering rootDir/views/admin/edit-product.ejs &
also passing in product information
*/
exports.getEditProduct = (req, res, next) => {
  /* Retrieving prodId from req.params.productId fetched from Frontend */
  const prodId = req.params.productId;
  const route = `http://localhost:3005/admin/edit-product/:${prodId}?edit=true`;
  const method = 'router.get';
  const template = 'rootDir/views/admin/edit-product.ejs';
  const callbackName = `rootDir/controllers/admin.js\nexports.getEditProduct: RequestHandler = (req, res, next) => {}\n`;
  console.log(`\nHosting ${template} through ${method}\non ${route}\ncallbackName:\n${callbackName}\n\n`);
  
  /* Express built-in req.query.edit === 'true' */
  const editMode = req.query.edit;
  console.log(`editMode on route\n${route} is:\n${editMode}\n`);
  if (!editMode) {
    console.log(`Cannot edit route ${route}\nBecause req.query.edit !== true\nRedirecting to http://localhost:3005\n`);
    // Redirect to '/', if 'editMode !== true' undefined||false
    return res.status(303).redirect(303, "/");
  }
  /* Otherwise, start editing a product item */
  // Sequelize
  Product.findByPk(prodId)
  .then((eachProduct) => {
    if (!eachProduct) {
        return res.status(303).redirect(303, "/");
    }
    res.render('admin/edit-product', {
        product: eachProduct,
        editing: editMode,
        pageTitle: 'Edit Product',
        path: req.url ? req.url : `/admin/edit-product`
    })
  })
  .catch((err) => {
    console.log(`\nFailed to retrieve a product item through route:\n${route}\nError logging:\n${err}\n`)
  });
  // mysql2 connector
//   Product.findById(prodId, (retrievedProduct) => {
//     if (!retrievedProduct) {
//       return res.status(303).redirect(303, "/");
//     }
//     res.render("admin/edit-product", {
//       path: req.url ? req.url : `/admin/edit-product`,
//       pageTitle: "Edit Product",
//       editing: editMode,
//       product: retrievedProduct,
//     });
//   });
};

/*
For POST request to http://localhost:3005/admin/edit-product route
Export a callback function to be used by routes/admin.js
*/
exports.postEditProduct = (req, res, next) => {
  const redirectRoute = 'http://localhost:3005/admin/products';
  // Extracting a product.id from req.body when editing a product
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const updatedImageUrl = req.body.imageUrl;

  const route = `http://localhost:3005/admin/edit-product/${prodId}?edit=true`;
  const template = 'rootDir/views/admin/edit-product.ejs';
  const callbackName = `rootDir/controllers/admin.js\nexports.postEditProduct: RequestHandler = (req, res, next) => {}\n`;

  if (!prodId || !updatedTitle || !updatedPrice || !updatedDescription || !updatedImageUrl) {
    console.log(`\nFailed to retrieve req.body.params\nRedirecting to ${redirectRoute}`);
    return res.status(501).redirect('/admin/products');
  }

  console.log(`${callbackName} req.body:`);
  console.log(req.body);

  /* Using Sequelize Product.method() model to update a product item */
  Product.findByPk(prodId)
  .then((retrievedProduct) => {  
    if (!retrievedProduct) {
        console.log(`\nError retrieving prodId: ${prodId}\n`);
        res.status(404).json({ error: `Product NOT found `});
    }

    // Replacing retrieved productItem.keys with req.body.params
    retrievedProduct.title = updatedTitle;
    retrievedProduct.price = updatedPrice;
    retrievedProduct.description = updatedDescription;
    retrievedProduct.imageUrl = updatedImageUrl;  
    
    console.log(`\nroute:\n${route}\ntemplate:\n${template}\ncallbackName:\n${callbackName}\nhas just received an update request for item with prodId: ${prodId}\nupdatedTitle: ${updatedTitle}\nupdatedImageUrl: ${updatedImageUrl}\nupdatedDescription: ${updatedDescription}\nupdatedPrice: ${updatedPrice}\ncallbackName:\n${callbackName}\n\n`);
    console.log(retrievedProduct);

    return retrievedProduct.save();
  })
  .then((result) => {
    console.log(`\nOK! Succeeded in updating product item:\nprodId: ${prodId}\nupdatedTitle: ${updatedTitle}\nupdatedPrice: ${updatedPrice}\nupdatedDescription: ${updatedDescription}\nupdatedImageUrl: ${updatedImageUrl}\n`);
  })
  .catch((err) => {
    console.log(`\nFailed to fetch route:\n${route}\nusing callballName:\n${callbackName}\nError logging:\n${err}\n`);
    // res.status(501).json({ error: "Failed to update product" });
  });
  /* After updatedProduct.save() => redirect to 'views/admin/product'*/
  res.status(301).redirect('/admin/products');
};

/* 
For GET request to http://localhost:3005/admin/products route
Export a callback function to be used by routes/admin.js for 
rendering rootDir/views/admin/products.ejs
*/
exports.getProducts = (req, res, next) => {
  const route = 'http://localhost:3005/admin/products';
  const template = 'rootDir/views/admin/products.ejs';
  const method = 'router.get';
  const callbackName = `rootDir/controllers/admin.js\nexports.getProducts: RequestHandler = (req, res, next) => {}\n`;

  console.log(`\nHosting template:\n${template}\nthrough ${method} is in progress\nfor ${route}\ncallbackName:\n${callbackName}`);

  /* using 'public static void method' Product.fetchAll(cb): void to retrieve products[{}] stored in data/products.json file 
  */
  // Using Sequelize
  Product.findAll()
  .then((products) => {
    console.log(`\n${callbackName}OK!\nProduct.findAll().then((products) => console.log(products)):`);

    res.render('admin/products', {
        prods: products,
        pageTitle: 'Products (admin-view)',
        path: req.url ? req.url : 'admin/products'
    })
  })
  // MySQL2
//   Product.fetchAll((products) => {
//     console.log(`${callbackName}\nProduct.findAll().then((products) => console.log(products)):`);
//     console.log(products);
//     console.log(`\n`);

//     res.render('admin/products', {
//       path: req.url ? req.url : 'admin/products',
//       pageTitle: 'Products (admin-view)',
//       prods: products
//     });
//   });
};

/*
For POST request to http://localhost:3005/admin/delete-product route
Export a callback function to be used by routes/admin.js for
deleting a specific product from rootDir/data/products.json
*/
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  /* publicly invoking Product.deleteById(id) => 
    pass-in prodId received from req.body */
  Product.deleteById(prodId);
  /* After Product.deleteById(prodId) is complete */
  res.status(301).redirect("/admin/products");
};
