const express = require('express');
const app = express();
const ipinfo = require('ipinfo');
const fs = require("fs");  // Adicionado a importação do módulo 'fs'
const port = process.env.PORT || 3000;

// Middleware
const obterEnderecoIpMiddleware = require('./middlewares/obterEnderecoIpMiddleware');
app.use(['/ip', '/ip/:ipAddress'], obterEnderecoIpMiddleware);

// Função para verificar se a URL pertence ao Xvideos
function checkXvideosUrl(url) {
  const lowercaseUrl = url.toLowerCase();
  const patterns = ["www.xvideos.com", "xvideos.com"];

  return patterns.some(pattern => lowercaseUrl.includes(pattern));
}

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

// Rota para obter informações do Xvideos
app.get('/xvideos/:xvideosLink', async (req, res) => {
  const targetLink = req.params.xvideosLink;

  XVDL.getInfo(targetLink).then((inf) => {
    console.log(targetLink);
    const filePath = "caminho/do/arquivo";  // Defina o caminho adequado
    XVDL.download(targetLink, { type: "hq" }).pipe(fs.createWriteStream(filePath));
    const jsonResponse = {
      statusCode: 200,
      status: "sucesso",
      link: inf,
    };
    res.json(jsonResponse);
  });
});

// Rota para obter informações do IP padrão
app.get('/ip', async (req, res) => {
  ipinfo(req.enderecoIp, (err, data) => {
    if (err) {
      console.error(err);
      res.status(50
