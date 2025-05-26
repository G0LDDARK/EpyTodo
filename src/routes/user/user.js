/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** user
*/

const express = require('express');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../../middleware/auth');
const { findUserById, findUserByEmail, updateUser,
    deleteUser, findTodosByUserId
} = require('./user.query');

const router = express.Router();

router.use(authMiddleware);

router.get('/user', async (req, res) => {
    try {
        const user = await findUserById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'Not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.get('/user/todos', async (req, res) => {
    try {
        const todos = await findTodosByUserId(req.user.id);
        res.json(todos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.get('/users/:identifier', async (req, res) => {
    const { identifier } = req.params;

    try {
        const user = isNaN(Number(identifier))
            ? await findUserByEmail(identifier)
            : await findUserById(Number(identifier));
        if (!user) return res.status(404).json({ msg: 'Not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { email, name, firstname, password } = req.body;

    if (!email || !name || !firstname) {
        return res.status(400).json({ msg: 'Bad parameter' });
    }

    try {
        let passwordHash = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            passwordHash = await bcrypt.hash(password, salt);
        }
        const updated = await updateUser(Number(id), {
            email,
            name,
            firstname,
            passwordHash
        });
        if (!updated) {
            return res.status(404).json({ msg: 'Not found' });
        }
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const user = await findUserById(Number(id));
        if (!user) return res.status(404).json({ msg: 'Not found' });
        await deleteUser(Number(id));
        res.json({ msg: `Successfully deleted record number: ${id}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

module.exports = router;
