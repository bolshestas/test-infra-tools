const db = require('../persistence');
const { publishEvent } = require('../kafka');

module.exports = async (req, res) => {
    await db.updateItem(req.params.id, {
        name: req.body.name,
        completed: req.body.completed,
    });

    const item = await db.getItem(req.params.id);

    await publishEvent('todo.updated', item);

    res.send(item);
};
