/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** todos
*/

const express = require('express');
const db = require("../../config/db");
const authMiddleware = require('../../middleware/auth');
const { updateTodo, findTodoById, deleteTodo } = require('./todos.query');
const router = express.Router();

router.use(authMiddleware);

router.get('/todos', async (req, res) => {
    try {
        const [todos] = await db.query(
            'SELECT * FROM todo WHERE user_id = ?',
            [req.user.id]
        );
        todos.forEach(element => {
            const isoDate = new Date(element.due_time);
            element.due_time = isoDate.toISOString().replace('T', ' ').slice(0, 19);
        });
        res.json(todos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.get('/todos/:id', async (req, res) => {
    const todoId = req.params.id;

    try {
        const [rows] = await db.query(
            'SELECT * FROM todo WHERE id = ? AND user_id = ?',
            [todoId, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        const isoDate = new Date(rows[0].due_time);
        rows[0].due_time = isoDate.toISOString().replace('T', ' ').slice(0, 19);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.post('/todos', async (req, res) => {
    const { title, description, due_time, status } = req.body;

    if (!title || !description || !due_time || !status) {
        return res.status(400).json({ msg: 'Missing fields' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO todo (title, description, due_time, status, user_id)
            VALUES (?, ?, ?, ?, ?)`,
            [title, description, due_time, status, req.user.id]
        );
        const [rows] = await db.query(
            'SELECT * FROM todo WHERE id = ? AND user_id = ?',
            [result.insertId, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        const isoDate = new Date(rows[0].due_time);
        rows[0].due_time = isoDate.toISOString().replace('T', ' ').slice(0, 19);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, due_time, user_id, status } = req.body;

    if (!title || !description || !due_time|| !user_id || !status) {
        return res.status(400).json({ msg: 'Bad parameter' });
    }
    try {
        const updated = await updateTodo(Number(id), {
            title,
            description,
            due_time,
            user_id,
            status
        });
        if (!updated) {
            return res.status(404).json({ msg: 'Not found' });
        }
        const [rows] = await db.query(
            'SELECT * FROM todo WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        const isoDate = new Date(rows[0].due_time);
        rows[0].due_time = isoDate.toISOString().replace('T', ' ').slice(0, 19);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await findTodoById(Number(id));
        if (!user) return res.status(404).json({ msg: 'Not found' });
        await deleteTodo(Number(id));
        res.json({ msg: `Successfully deleted record number: ${id}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

module.exports = router;
