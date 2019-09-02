module.exports = {
  dialect: "mysql",
  host: "127.0.0.1",
  port: 3306,
  database: "eframework",
  username: "azbox",
  password: "Rpi@123",
  logging: false,
  pool: {
    max: 5,
    min: 1,
    acquire: 3000,
    idle: 1000
  },
  define: {
    underscored: false,
    freezeTableName: true,
    charset: 'utf8',
    dialectOptions: {
      collate: 'utf8_general_ci'
    },
    timestamps: false
  }
};