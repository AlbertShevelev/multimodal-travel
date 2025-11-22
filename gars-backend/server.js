const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes');
const searchRoutes = require("./search");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.use("/api", searchRoutes);

app.get('/', (req, res) => {
  res.send('GARS backend is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
