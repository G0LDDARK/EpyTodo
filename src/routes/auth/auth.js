/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** auth
*/

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser } = require('../user/user.query');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, name, firstname, password } = req.body;

    if (!email || !name || !firstname || !password) {
        return res.status(400).json({ msg: 'Bad parameter' });
    }

    try {
        const userExists = await findUserByEmail(email);
        if (userExists) {
            return res.status(409).json({ msg: 'Account already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashPwd = await bcrypt.hash(password, salt);
        const insertId = await createUser(email, name, firstname, hashPwd);
        const payload = { user: { id: insertId } };
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });

        return res.status(201).json({ token });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ msg: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'Bad parameter' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });

        return res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ msg: 'Internal server error' });
    }
});

module.exports = router;
