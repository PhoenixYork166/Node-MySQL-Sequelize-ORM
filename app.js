const express = require('express');
const path = require('path');
/* Express now has built-in req.body parse */
// const bodyParser = require('body-parser');
const rootDir = require('./util/path');
const errorController = require('./controllers/error');

/* Using Sequelize */
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

/* When using MySQL connection pool */
// const db = require('./util/database');

/* Instantiating Express app */
const app = express();
console.log(`root directory is:\n${rootDir}`);

/* Configuring Express.js to use EJS as its templating engine */
app.set('view engine', 'ejs');
/* This tells Express the path to find template files
1st 'views' = rootDir/views folder 
2nd 'views' = name of directory */
app.set('views', 'views');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// Express.js bodyParser is deprecated...
app.use(express.urlencoded({ extended: false }));
// For parsing application/json
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

/* Adding a middleware for 'user' 
user is only available if our Node app starts listening for req */
app.use((req, res, next) => {
    User.findByPk(1) // retrieving a user from db
    .then(user => {
        // Storing user retrieved from db into a REQ
        // req.user = Sequelize object with values stored in db
        // user now has all utility methods e.g. .destroy()
        req.user = user;
        next();
    })
    .catch(err => { console.log(`User Middleware Error:`); console.log(err); });
});

/* As we changed the way we export objects in routes/admin.js */
app.use('/admin', adminRoutes);
/* Using Express middleware for shopRoutes routes/shop.js */
app.use(shopRoutes);

/* Using Express middleware for 404 routes routes/404.js */
app.use(errorController.get404);

/* Error Handling middleware for all Non-defined routes */
app.use((error, req, res, next) => {
    console.error(`Error: ${error.message}`);
    res.status(error.status || 501).send({ 
        message: error.message || `Server Internal Error`,
        error: process.env.NODE_ENV === 'development' ? error : {}
    });
})

// Model Associations before Syncing Sequelize to allow Magic methods
// User-Product One-To-Many Relationship
User.hasMany(Product);
// Complementing User.hasMany(Product) relationship by specifying the other side of relationship
// onDelete: 'CASCADE' => when one User is deleted => all associated Product records auto-deleted
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });

// User-Cart One-To-One Relationship
User.hasOne(Cart);
// Complementing on the other side
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem }); // One Cart holds many products
Product.belongsToMany(Cart, { through: CartItem }); // One Product can be part of many Carts

// All Error Handling middleware must be above sequelize.sync()
sequelize
// NOT used in Prod, only to reflect new changes to created tables
//.sync({ force: true }) 
.sync()
.then(result => {
    // try looking for a user
    return User.findByPk(1);
})
.then((user) => {
    // if there's no User found => create
    if (!user) {
        return User.create({name: 'admin', email: 'admin@test.com'});
    }
    return Promise.resolve(user);
})
.then((user) => {
    console.log(`\nUser retrieved from db:`);
    console.log(user.toJSON());
    console.log(`\n`);
    
    // if !user.cart => Create a Cart for User
    return user.getCart()
    .then(cart => {
        if (!cart) {
            return user.createCart();
        } else {
            return cart;
        }
    })
})
.then((cart) => {
    console.log(`\nOK!\nSucceeded in connecting Node app to Database\n`);
    const port = 3005;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}\n`);
    });
})
.catch((err) => {
    console.log(`\nError rootDir/app.js sequelize.sync()\n${err}\n`);
});

