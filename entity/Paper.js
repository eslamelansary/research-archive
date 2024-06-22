const { EntitySchema } = require('typeorm');
const paperStatus = {
    DOWNLOADED: 'downloaded',
    PENDING: 'pending review',
    ACCEPTED: 'accepted',
    REVIEWED: 'reviewed',
    REJECTED: 'rejected',
}

module.exports = new EntitySchema({
    name: 'Paper',
    tableName: 'papers',
    columns: {
        createdAt: {
            type: 'timestamp',
        },
        updatedAt:{
            type: 'timestamp',
        },
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        name: {
            type: 'varchar'
        },
        filePath: {
            type: 'varchar'
        },
        topic: {
            type: 'varchar',
            default: null,
        },
        authorId: {
            type: 'int'
        },
        authorName:{
            type: 'varchar',
        },
        status: {
            type: 'enum',
            enum: Object.values(paperStatus),
            default: paperStatus.PENDING
        },
        comments: {
            type: 'json',
            nullable: true,
        },
        minimum_reviewers: {
            type: 'int',
            default: 1
        },
        accepting_reviewers: {
            type: 'int',
            default: 0
        }
    },
    relations: {
        users: {
            type: 'many-to-many',
            target: 'User',
            joinTable: {
                name: 'paper_reviewer', // Join table name
                inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
                joinColumn: { name: 'paperId', referencedColumnName: 'id' }
            }
        },
    }
});
