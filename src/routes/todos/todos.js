/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** todos
*/

const express = require('express');

const authMiddleware = require('../../middleware/auth');
const {
    findAllTodosByUserId, findTodoByIdAndUserId, createTodo,
    updateTodo, findTodoById, deleteTodo
} = require('./todos.query');

const router = express.Router();

router.use(authMiddleware);

const formatTodoDate = (todo) => {
    if (todo && todo.due_time) {
        const isoDate = new Date(todo.due_time);
    }
    return todo;
};

router.get('/todos', async (req, res) => {
    try {
        const todos = await findAllTodosByUserId(req.user.id);
        res.json(todos.map(formatTodoDate));
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.get('/todos/:id', async (req, res) => {
    const todoId = req.params.id;

    try {
        const todo = await findTodoByIdAndUserId(todoId, req.user.id);
        if (!todo) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        res.json(formatTodoDate(todo));
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
        const newTodo = await createTodo(title, description, due_time, status, req.user.id);
        if (!newTodo) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        res.status(201).json(formatTodoDate(newTodo));
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.put('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, due_time, user_id, status } = req.body;

    if (!title || !description || !due_time || !user_id || !status) {
        return res.status(400).json({ msg: 'Bad parameter' });
    }
    try {
        const targetTodo = await findTodoById(Number(id));
        if (!targetTodo) {
            return res.status(404).json({ msg: 'Not found' });
        }

        await updateTodo(Number(id), { title, description, due_time, user_id, status });
        const updatedTodo = await findTodoByIdAndUserId(id, req.user.id);
        if (!updatedTodo) {
            return res.status(404).json({ msg: 'Todo not found' });
        }
        res.json(formatTodoDate(updatedTodo));
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const todo = await findTodoById(Number(id));
        if (!todo) {
            return res.status(404).json({ msg: 'Not found' });
        }

        await deleteTodo(Number(id));
        res.json({ msg: `Successfully deleted record number: ${id}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

module.exports = router;
