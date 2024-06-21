const { EntitySchema } = require('typeorm');
const paperStatus = {
    DOWNLOADED: 'downloaded',
    PENDING: 'pending review',
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
        topicId: {
            type: 'int',
            default: null,
        },
        authorId: {
            type: 'int'
        },
        status: {
            type: 'enum',
            enum: Object.values(paperStatus),
            default: paperStatus.PENDING
        }
    }
});
