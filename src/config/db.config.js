const Sequelize = require("sequelize");
const { config } = require("../core/config");

const sequelize = new Sequelize(
    config.database.database,
    config.database.user,
    config.database.password,
    {
        host: config.database.host,
        dialect: "mysql",
        port: config.database.port,
        pool: {
            max: config.database.connectionLimit,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false
    }
);

module.exports = sequelize;
