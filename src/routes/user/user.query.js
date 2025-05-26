/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** user.query
*/

const db = require('../../config/db');

async function findUserById(id) {
    const [rows] = await db.query(
        'SELECT * FROM user WHERE id = ?',
        [id]
    );
    return rows[0] || null;
}

async function findUserByEmail(email) {
    const [rows] = await db.query(
        'SELECT * FROM user WHERE email = ?',
        [email]
    );
    return rows[0] || null;
}

async function updateUser(id, { email, name, firstname, passwordHash }) {
    await db.query(
        `UPDATE user
        SET email = ?, name = ?, firstname = ?, password = IFNULL(?, password)
        WHERE id = ?`,
        [email, name, firstname, passwordHash, id]
    );
    return findUserById(id);
}

async function deleteUser(id) {
    await db.query('DELETE FROM user WHERE id = ?', [id]);
}

async function findTodosByUserId(userId) {
    const [rows] = await db.query(
        `SELECT id, title, description, created_at, due_time, status, user_id
        FROM todo WHERE user_id = ?`,
        [userId]
    );
    return rows;
}

module.exports = {
    findUserById,
    findUserByEmail,
    updateUser,
    deleteUser,
    findTodosByUserId
};
