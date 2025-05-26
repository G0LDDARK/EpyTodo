/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** notFound
*/

module.exports = (req, res) => {
    res.status(404).json({ msg: 'Not found' });
};
