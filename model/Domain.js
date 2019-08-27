module.exports = (sequelize, DataTypes) => {
  const { BIGINT, STRING, TEXT, INTEGER, DATE } = DataTypes;
  const Domain = sequelize.define('domain',{
    id: {
      type: BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: STRING(45),
    domain: STRING(45),
    url: STRING(45),
    remark: STRING,
    order: INTEGER.UNSIGNED
  });
  return Domain;
}