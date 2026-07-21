const express = require('express');
const app = express();

const db = require('./persistence');
const {
    connectKafka,
    disconnectKafka,
} = require('./kafka');
const {
    metricsMiddleware,
    metricsHandler,
} = require('./metrics');

const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

app.use(express.json());
app.use(metricsMiddleware);
app.use(express.static(__dirname + '/static'));

app.get('/metrics', metricsHandler);
app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

async function start() {
    await db.init();
    await connectKafka();

    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
}

start().catch((err) => {
    console.error('Application startup failed:', err);
    process.exit(1);
});

async function gracefulShutdown() {
    console.log('Shutting down application');

    await Promise.allSettled([
        disconnectKafka(),
        db.teardown(),
    ]);

    process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown);
