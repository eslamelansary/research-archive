const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Topic',
    tableName: 'topics',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        name: {
            type: 'varchar',
            unique: true,
            nullable: false
        },
    }
});