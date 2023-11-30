const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  if (!!req.headers['cf-connecting-ip']) {
    // Se estiver passando pelo Cloudflare
    enderecoIp = req.headers['cf-connecting-ip'];
  } else if (!!req.headers['x-forwarded-for']) {
    // Se não estiver passando pelo Cloudflare, mas estiver usando um proxy
    enderecoIp = req.headers['x-forwarded-for'];
  } else {
    // Caso contrário, obtém o IP diretamente
    enderecoIp = req.ip;
  }

  res.json(enderecoIp);
});

app.listen(port, "0.0.0.0", function () {
    console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});
