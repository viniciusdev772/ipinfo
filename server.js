const express = require('express');
const app = express();
const ipinfo = require('ipinfo');
const port = process.env.PORT || 3000;

function enderecoIp(req){
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
  return enderecoIp;
}

app.get('/', async (req, res) => {
  
  res.json(enderecoIp(req));
});

app.get('/ip', async (req, res) => {
  const targetIP = enderecoIp(req); // Substitua pelo endereço IP desejado
  ipinfo(targetIP, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao obter informações do IP específico.' });
    } else {
      res.json(data);
    }
  });
});

app.listen(port, "0.0.0.0", function () {
    console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});
