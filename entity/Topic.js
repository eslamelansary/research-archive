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
    },
    relations: {
        users: {
            type: 'many-to-many',
            target: 'User',
            joinTable: {
                name: 'topic_reviewer', // Join table name
                inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
                joinColumn: { name: 'topicId', referencedColumnName: 'id' }
            }
        },
    }
});