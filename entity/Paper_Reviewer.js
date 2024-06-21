const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Paper_Reviewer',
    tableName: 'paper_reviewer',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        assignedAt: {
            type: 'timestamp',
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
        paper: {
            type: 'many-to-one',
            target: 'Paper',
            joinColumn: {
                name: 'paperId',
                referencedColumnName: 'id'
            },
            onDelete: 'CASCADE',
            nullable: false,
            joinTable: false
        }
    }
});
