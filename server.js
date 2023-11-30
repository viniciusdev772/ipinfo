const express = require('express');
const ipinfo = require('ipinfo');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const enderecoIp = req.ip; // Pode precisar usar req.clientIp se estiver usando o middleware request-ip

  ipinfo(enderecoIp, (err, informacoesIp) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao obter informações do IP');
    } else {
      res.json(informacoesIp);
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
