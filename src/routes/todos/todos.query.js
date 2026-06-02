/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** todos.query
*/

const db = require("../../config/db");

async function findAllTodosByUserId(userId) {
    const [rows] = await db.query('SELECT * FROM todo WHERE user_id = ?', [userId]);
    return rows;
}

async function findTodoById(id) {
    const [rows] = await db.query('SELECT * FROM todo WHERE id = ?', [id]);
    return rows[0] || null;
}

async function findTodoByIdAndUserId(id, userId) {
    const [rows] = await db.query('SELECT * FROM todo WHERE id = ? AND user_id = ?', [id, userId]);
    return rows[0] || null;
}

async function createTodo(title, description, due_time, status, user_id) {
    const [result] = await db.query(
        `INSERT INTO todo (title, description, due_time, status, user_id) VALUES (?, ?, ?, ?, ?)`,
        [title, description, due_time, status, user_id]
    );
    return findTodoByIdAndUserId(result.insertId, user_id);
}

async function updateTodo(id, { title, description, due_time, user_id, status }) {
    await db.query(
        `UPDATE todo SET title = ?, description = ?, due_time = ?, user_id = ?, status = ? WHERE id = ?`,
        [title, description, due_time, user_id, status, id]
    );
    return findTodoById(id);
}

async function deleteTodo(id) {
    const [result] = await db.query('DELETE FROM todo WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

module.exports = {
    findAllTodosByUserId,
    findTodoById,
    findTodoByIdAndUserId,
    createTodo,
    updateTodo,
    deleteTodo
};
