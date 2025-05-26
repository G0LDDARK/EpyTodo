/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** middlewate auth
*/

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ msg: 'No token , authorization denied' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ msg: 'Token is not valid' });
    }

    const token = parts[1];
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = { id: decoded.user.id };
        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};
