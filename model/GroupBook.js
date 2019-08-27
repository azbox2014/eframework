module.exports = (sequelize, DataTypes) => {
  const { BIGINT, STRING, TEXT, INTEGER, DATE } = DataTypes;
  const GroupBook = sequelize.define('group_book',{
    id: {
      type: BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    group_id: BIGINT.UNSIGNED,
    book_id: BIGINT.UNSIGNED,
    order: INTEGER.UNSIGNED
  });
  return GroupBook;
}