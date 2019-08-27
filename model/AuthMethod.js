module.exports = (sequelize, DataTypes) => {
  const { BIGINT, STRING, TEXT, INTEGER, DATE } = DataTypes;
  const AuthMethod = sequelize.define("auth_method", {
    id: {
      type: BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: BIGINT.UNSIGNED,
    auth_type: INTEGER.UNSIGNED,
    auth_id: STRING,
    auth_pwd: STRING,
    created_time: DATE,
    updated_titme: DATE
  });
  return AuthMethod;
}