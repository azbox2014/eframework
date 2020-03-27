// module.exports = knex => {
//     return knex.schema.createTable('chapters', table => {
//         table.increments("id").unsigned().primary().notNullable();
//         table.integer("book_id").unsigned().index().notNullable();
//         table.integer("order").unsigned().index().notNullable();
//         table.text("content");
//     });
// }

module.exports = ['chapters', table => {
    table.increments("id").unsigned().primary().notNullable();
    table.integer("book_id").unsigned().index().notNullable();
    table.integer("order").unsigned().index().notNullable();
    table.text("content");
}];