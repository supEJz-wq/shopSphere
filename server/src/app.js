const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const notFound = require('./middleware/notFound.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const { env } = require('./config/env');
const { uploadDir } = require('./middleware/upload.middleware');

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ShopSphere API is running.' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
