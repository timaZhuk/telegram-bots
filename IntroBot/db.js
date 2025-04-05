const { Sequelize } = require("sequelize");

module.exports = new Sequelize("bot_sql", "root", "password", {
  host: "5.188.128.98",
  port: "6432",
  dialect: "postgres",
});
