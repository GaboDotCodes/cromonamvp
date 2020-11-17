const mongoose = require('mongoose');

const { MONGO_URI } = process.env;
const { log, error } = console;

const connect = () => {
  mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (err) => {
    error(err);
  });
  const db = mongoose.connection;
  db.once('open', () => log(`Connection success [Mongo] ${MONGO_URI}`));
  return db;
};

module.exports = {
  connect,
};