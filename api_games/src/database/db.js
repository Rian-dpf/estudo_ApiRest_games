const Sequelize = require("sequelize");

const connection = new Sequelize("api_rest_intro", "root", "rian123456&", {
    host: "localhost",
    dialect: "mysql",
});

module.exports = connection;