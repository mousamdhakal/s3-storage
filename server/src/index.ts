import dotenv from 'dotenv';
import express from 'express';
import apiRoutes from './route';
import { errorHandler } from './middleware/errorhandler';
var cors = require('cors');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

// Page not found
app.use((req, res, next) => {
  // 404 catch block
  next({
    message: 'Not Found',
    status: 404,
  });
});

// Error handler
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
