import express, {Express} from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import testRoutes from './routes';

const app: Express = express();

const PORT: string | number = process.env.PORT || 4000;
const MONGODB_USER : string = process.env.MONGODB_USER || 'root';
const MONGODB_PASSWORD : string = process.env.MONGODB_PASSWORD || 'password';
const MONGODB_HOST_AND_PORT : string = process.env.MONGODB_HOST_AND_PORT || 'localhost:27017';

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
