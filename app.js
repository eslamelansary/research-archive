const express = require('express');
const bodyParser = require('body-parser');
const { createConnection } = require('typeorm');
const logger = require('winston');
const errorMiddleware = require("./middlewares/errorMiddleware");
const {loggerMiddleware} = require("./middlewares/logger");
const app = express();
const port = 8000;

logger.add(new logger.transports.Console());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(errorMiddleware);

// Database connection
createConnection().then(async connection => {
    console.log('Connected to the database');

    // Routes
    const userRoutes = require('./routes/userRoutes');
    const paperRoutes = require('./routes/paperRoutes');
    const topicRoutes = require('./routes/topicRoutes');
    const reviewerRoutes = require('./routes/reviewerRoutes');

    app.use('/users', userRoutes);
    app.use('/papers', paperRoutes);
    app.use('/topics', topicRoutes);
    app.use('/reviewers', reviewerRoutes);
    app.use('/', (req, res) => {    
        res.send("`Server is running!")
    })    
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(error => console.log(error));

function s (err, req, res, next){
    // Extract the error message from the error object
    const errorMessage = err.message || 'Internal Server Error';
    res.status(500).json({ message: errorMessage });
}