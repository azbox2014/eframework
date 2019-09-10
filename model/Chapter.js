module.exports = (sequelize, DataTypes) => {
  const { BIGINT, STRING, TEXT, INTEGER, DATE } = DataTypes;
  const Chapter = sequelize.define('chapter', {
    id: {
      type: BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: STRING(45),
    author: STRING(45),
    desc: TEXT,
    status: INTEGER.UNSIGNED,  // 1.  上架; 2. 部分下架;  3. 部分上架;   4. 下架
    remark: DataTypes.JSON,
    created_time: DATE,
    updated_titme: DATE
  });
  return Chapter;
}