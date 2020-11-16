const express = require('express');
const app = express();

const { log } = console;

const { PORT } = process.env;



app.listen( PORT, () => log(`Listen on http://localhost:${PORT}`) )