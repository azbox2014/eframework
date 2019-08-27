module.exports = (sequelize, DataTypes) => {
  const { BIGINT, STRING, TEXT, INTEGER, DATE } = DataTypes;
  const GroupInfo = sequelize.define('group_info',{
    id: {
      type: BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    code: STRING(45),
    domain_id: BIGINT.UNSIGNED,
    title: STRING(45),
    order: INTEGER.UNSIGNED,
    created_time: DATE,
    updated_titme: DATE
  });
  return GroupInfo;
}