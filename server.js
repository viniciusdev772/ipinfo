const express = require('express');
const ipinfo = require('ipinfo');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const enderecoIp = req.ip; // Pode precisar usar req.clientIp se estiver usando o middleware request-ip

  ipinfo(enderecoIp, (err, informacoesIp) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erro ao obter informações do IP');
    } else {
      //res.json(informacoesIp);
      res.status(500).send('Erro ao obter informações do IP');
    }
  });
});

app.listen(port, "0.0.0.0", function () {
    console.log(`Servidor rodando em http://0.0.0.0:${port}`);
  });
