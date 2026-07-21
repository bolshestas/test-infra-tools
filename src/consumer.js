const { Kafka } = require('kafkajs');

const brokers = (process.env.KAFKA_BROKERS || '')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

const topic = process.env.KAFKA_TOPIC || 'todo-events';
const groupId = process.env.KAFKA_GROUP_ID || 'todo-audit-workers';

if (brokers.length === 0) {
    console.error('KAFKA_BROKERS is required');
    process.exit(1);
}

const kafka = new Kafka({
    clientId: 'todo-event-consumer',
    brokers,
});

const consumer = kafka.consumer({ groupId });

async function start() {
    await consumer.connect();
    await consumer.subscribe({
        topic,
        fromBeginning: false,
    });

    console.log(`Kafka consumer connected: group=${groupId}, topic=${topic}`);

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const key = message.key?.toString() || null;
            const value = message.value?.toString() || null;

            console.log(JSON.stringify({
                topic,
                partition,
                offset: message.offset,
                key,
                event: value ? JSON.parse(value) : null,
            }));
        },
    });
}

async function shutdown() {
    console.log('Stopping Kafka consumer');
    await consumer.disconnect();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((error) => {
    console.error('Kafka consumer failed:', error);
    process.exit(1);
});
