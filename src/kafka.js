const { Kafka } = require('kafkajs');

const brokers = (process.env.KAFKA_BROKERS || '')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

const topic = process.env.KAFKA_TOPIC || 'todo-events';

let producer = null;

async function connectKafka() {
    if (brokers.length === 0) {
        console.log('Kafka disabled: KAFKA_BROKERS is not configured');
        return;
    }

    const kafka = new Kafka({
        clientId: 'todo-app',
        brokers,
    });

    producer = kafka.producer();
    await producer.connect();

    console.log(`Kafka producer connected to ${brokers.join(', ')}`);
}

async function publishEvent(type, item) {
    if (!producer) {
        return;
    }

    await producer.send({
        topic,
        messages: [
            {
                key: item.id,
                value: JSON.stringify({
                    type,
                    item,
                    timestamp: new Date().toISOString(),
                }),
            },
        ],
    });
}

async function disconnectKafka() {
    if (producer) {
        await producer.disconnect();
        producer = null;
    }
}

module.exports = {
    connectKafka,
    publishEvent,
    disconnectKafka,
};
