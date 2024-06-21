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
        }
    },
    relations: {
        reviewer: {
            target: 'Reviewer',
            type: 'one-to-one',
            inverseSide: 'user',
            joinColumn: true
        }
    }
});
