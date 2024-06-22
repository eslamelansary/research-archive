const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Counter',
    tableName: 'counters',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        }
    }
});
