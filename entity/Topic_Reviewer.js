const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Topic_Reviewer',
    tableName: 'topic_reviewer',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        }
    },
    relations: {
        reviewer: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: {
                name: 'reviewerId',
                referencedColumnName: 'id'
            },
            onDelete: 'CASCADE',
            nullable: false,
            joinTable: false
        },
        topic: {
            type: 'many-to-one',
            target: 'Topic',
            joinColumn: {
                name: 'topicId',
                referencedColumnName: 'id'
            },
            onDelete: 'CASCADE',
            nullable: false,
            joinTable: false
        }
    }
});
