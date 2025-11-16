const express = require('express');
const app = express();
const routesController = require('./components/routesController');

app.use(express.json());
app.use('/api', routesController);

app.get('/', (req, res) => {
  res.send('GARS API is running');
});

app.listen(5000, () => console.log('Server running on port 5000'));
