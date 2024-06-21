const { EntitySchema } = require('typeorm');
const User = require('../entity/User');
const Topic = require('../entity/Topic');

module.exports = new EntitySchema({
    name: 'Reviewer',
    tableName: 'reviewers',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        userId: {
            type: 'int'
        },
        assignedPapersCount: {
            type: 'int',
            default: 0
        }
    },
    relations: {
        user: {
            target: 'User',
            type: 'one-to-one',
            inverseSide: 'reviewer',
            joinColumn: 'userId'
        },
        topics: {
            target: 'Topic',
            type: 'one-to-many',
            inverseSide: 'reviewer',
            joinColumn: 'userId'
        }
    }
});
