// const db = require('../util/database');
const Sequelize = require('sequelize');

// Import instantiated 'sequelize' JavaScript object
const sequelize = require('../util/database');
const { timeStamp } = require('console');

/* Using Sequelize to define a Product model */
/* From Documentations 
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const User = sequelize.define(
  'User',
  {
    // Model attributes are defined here
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      // allowNull defaults to true
    },
  },
  {
    // Other model options go here
  },
);

// `sequelize.define` also returns the model
console.log(User === sequelize.models.User); // true
*/

/* Low-level implementations
sequelize.define(
  modelName: string,
  attributes: sequelize.DefineModelAttributes<T>,
  options?: sequelize.DefineOptions<T>
): sequelize.Model<TInstance, TAttributes>
*/
const Product = sequelize.define('product', {
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
  },
});

module.exports = Product;