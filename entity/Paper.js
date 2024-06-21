const { EntitySchema } = require('typeorm');
const paperStatus = {
    DOWNLOADED: 'downloaded',
    PENDING: 'pending review',
    ACCEPTED: 'accepted',
    REVIEWED: 'reviewed'
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
        }
    }
});
