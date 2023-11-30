const express = require('express');
const app = express();
const ipinfo = require('ipinfo');
const port = process.env.PORT || 3000;


function checkXvideosUrl(url) {
  // Convert the URL to lowercase for case-insensitive matching
  const lowercaseUrl = url.toLowerCase();

  // Define the patterns to check
  const patterns = ["www.xvideos.com", "xvideos.com"];

  // Check if any of the patterns exist in the URL
  for (const pattern of patterns) {
    if (lowercaseUrl.includes(pattern)) {
      return true; // URL contains xvideos
    }
  }

  return false; // URL does not contain xvideos
}

// Middleware
const obterEnderecoIpMiddleware = require('./middlewares/obterEnderecoIpMiddleware');
app.use(obterEnderecoIpMiddleware);

// Rota principal
app.get('/', async (req, res) => {
  res.json({ enderecoIp: req.enderecoIp });
});



// Rota para obter informações do IP
app.get('/ip/:ipAddress', async (req, res) => {
  const targetIP = req.params.ipAddress || req.enderecoIp;

  ipinfo(targetIP, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao obter informações do IP específico.' });
    } else {
      delete data.readme;
      res.json(data);
    }
  });
});


const { XVDL } = require("xvdl");


app.get('/xvideos/:XvideosLink', async (req, res) => {
  const targetIP = req.params.XvideosLink;

  const fs = require("fs");
  const path = require("path");


  XVDL.getInfo(url).then((inf) => {
    console.log(url);
    XVDL.download(url, { type: "hq" }).pipe(fs.createWriteStream(filePath));
    const jsonResponse = {
      statusCode: 200,
      status: "sucesso",
      link: url,
    };
    res.json(jsonResponse);
  });
});
  


// Rota para obter informações do IP padrão
app.get('/ip', async (req, res) => {
  ipinfo(req.enderecoIp, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao obter informações do IP padrão.' });
    } else {
      delete data.readme;
      res.json(data);
    }
  });
});

// Inicia o servidor
app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});
