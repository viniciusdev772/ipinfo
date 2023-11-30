const express = require('express');
const ipinfo = require('ipinfo');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const enderecoIp = req.headers['x-real-ip'] || req.ip;
  res.json(enderecoIp);
});

app.listen(port, "0.0.0.0", function () {
    console.log(`Servidor rodando em http://0.0.0.0:${port}`);
  });
