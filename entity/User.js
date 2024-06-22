const { EntitySchema } = require('typeorm');

const roleEnum=  {
    REVIEWER: 'reviewer',
    AUTHOR: 'author',
    EDITOR: 'editor',
}

module.exports = new EntitySchema({
    name: 'User',
    tableName: 'users',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        username: {
            type: 'varchar'
        },
        password: {
            type: 'varchar',
            select: false
        },
        role: {
            type: 'enum',
            enum: roleEnum,
        },
    },
    relations: {
        topics: {
            type: 'many-to-many',
            target: 'Topic',
            joinTable: {
                name: 'topic_reviewer', // Join table name
                joinColumn: { name: 'userId', referencedColumnName: 'id' },
                inverseJoinColumn: { name: 'topicId', referencedColumnName: 'id' }
            }
        },
        papers: {
            type: 'many-to-many',
            target: 'Paper',
            joinTable: {
                name: 'paper_reviewer', // Join table name
                joinColumn: { name: 'userId', referencedColumnName: 'id' },
                inverseJoinColumn: { name: 'paperId', referencedColumnName: 'id' }
            }
        },
    }
});
