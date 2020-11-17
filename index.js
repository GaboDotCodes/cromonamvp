const express = require('express');

const { connect } = require('./db/connect');

const { log } = console;

const { PORT } = process.env;

connect();
const app = express();

app.listen( PORT, () => log(`Listen on http://localhost:${PORT}`) )