import express, {Express} from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import testRoutes from './routes';
import {PORT, MONGODB_USER, MONGODB_PASSWORD, MONGODB_HOST_AND_PORT}
  from './config';

const app: Express = express();

app.use(cors());
app.use(testRoutes);

const uri: string = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST_AND_PORT}`;
const options = {useNewUrlParser: true, useUnifiedTopology: true};
mongoose.set('useFindAndModify', false);

mongoose
    .connect(uri, options)
    .then(() =>
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`),
      ),
    )
    .catch((error) => {
      throw error;
    });
