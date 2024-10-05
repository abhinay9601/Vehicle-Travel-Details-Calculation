const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();


const PORT = process.env.PORT;
const routes = require('./routes/Routes');

app.use(express.json({ limit: '50mb' }));
app.use(cors());

require('./db');

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
