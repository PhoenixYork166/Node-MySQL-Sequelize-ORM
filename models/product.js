// const db = require('../util/database');
const Sequelize = require('sequelize');

// Import instantiated 'sequelize' JavaScript object
const sequelize = require('../util/database');

// Define Product model by importing instantiated JavaScript object, instead of 'class Product'
/* sequelize.define(
  modelName: string,
  attributes: sequelize.DefineModelAttributes<T>,
  options?: sequelize.DefineOptions<T>
): sequelize.Model<TInstance, TAttributes>
*/
const Product = sequelize.define('products', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Product;