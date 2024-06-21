const { EntitySchema } = require('typeorm');
const Reviewer = require('./Reviewer');

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
            type: 'varchar'
        },
        description: {
            type: 'text'
        },
        userId: {
            type: 'int',
        },
        // relations: {
        //     reviewer: {
        //         target: 'Reviewer',
        //         type: 'many-to-one',
        //         inverseSide: 'topics',
        //         joinColumn: 'userId'
        //     }
        // }
    },
});
