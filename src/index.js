/*
** EPITECH PROJECT, 2025
** EpyTodo
** File description:
** Main file
*/

const dotenv = require('dotenv');
const express = require('express');

const db = require('./config/db');
const authRouter  = require('./routes/auth/auth');
const userRouter = require('./routes/user/user');
const todoRouter = require('./routes/todos/todos');
const notFound = require('./middleware/notFound');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.use('/', authRouter);
app.use('/', userRouter);
app.use('/', todoRouter);
app.use(notFound);

(async () => {
    try {
        await db.getConnection();
        console.log('✅ Database connected ✅');
        console.log(`Running on port ${port}`);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
})();

app.listen(port, () => console.log('Starting server...'));
