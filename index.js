const express = require('express');

const { connect } = require('./db/connect');

const { log } = console;

const { PORT } = process.env;

connect();
const app = express();

const { connectSpreadsheet } = require('./utils/spreadsheet')

connectSpreadsheet()

app.listen( PORT, () => log(`Listen on http://localhost:${PORT}`) )