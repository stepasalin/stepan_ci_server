import {app} from './app';
import mongoose from 'mongoose';
import {PORT, MONGODB_USER, MONGODB_PASSWORD, MONGODB_HOST_AND_PORT}
  from './config';

const mongoUri: string = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST_AND_PORT}`;
const options = {useNewUrlParser: true, useUnifiedTopology: true};
mongoose.set('useFindAndModify', false);

mongoose
    .connect(mongoUri, options)
    .then(() =>
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`),
      ),
    )
    .catch((error) => {
      throw error;
    });
