const db = require('../persistence');
const { publishEvent } = require('../kafka');
const { v4: uuid } = require('uuid');

module.exports = async (req, res) => {
    const item = {
        id: uuid(),
        name: req.body.name,
        completed: false,
    };

    await db.storeItem(item);
    await publishEvent('todo.created', item);

    res.send(item);
};
