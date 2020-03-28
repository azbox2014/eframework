module.exports = knex => {
  return knex.schema.createTable('books', table => {
    table.increments("id").unsigned().primary().notNullable();
    table.string("title");
    table.string("author");
    table.binary("cover");
    table.text("desc");
  });
}
