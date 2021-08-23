import mongoose from 'mongoose';
import {MONGO_URI}
  from '../config';

const options = {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

(async () => {
  try {
    await mongoose.connect(
        MONGO_URI,
        options,
    );
  } catch (error) {
    console.log('Database connection error: ', error);
  }
})();

const db = mongoose.connection;
if (process.env.NODE_ENV !== 'test') {
  db.on('error', (error) => {
    console.log('Error while establishing database connection: ', error);
  });

  db.on('open', () => {
    console.log('Connection to database established successfully!!');
  });
}

export default db;
