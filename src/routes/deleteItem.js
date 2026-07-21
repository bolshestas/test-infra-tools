const db = require('../persistence');
const { publishEvent } = require('../kafka');

module.exports = async (req, res) => {
    const item = await db.getItem(req.params.id);

    await db.removeItem(req.params.id);
    await publishEvent('todo.deleted', item);

    res.sendStatus(200);
};
