/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** todos.query
*/

const db = require("../../config/db");

async function findTodoById(id) {
    const [rows] = await db.query(
        'SELECT * FROM todo WHERE id = ?',
        [id]
    );
    return rows[0] || null;
}

async function updateTodo(id, { title, description, due_time, user_id, status }) {
    await db.query(
        `UPDATE todo
        SET title = ?, description = ?, due_time = ?, user_id = ?, status = ?
        WHERE id = ?`,
        [title, description, due_time, user_id, status, id]
    );
    return findTodoById(id);
}

async function deleteTodo(id) {
    await db.query('DELETE FROM todo WHERE id = ?', [id]);
}

module.exports = {
    updateTodo,
    findTodoById,
    deleteTodo
};