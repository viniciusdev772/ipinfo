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

  try {
    const inf = await XVDL.getInfo(targetLink);

    const downloadLink = await XVDL.download(targetLink, { type: "hq" });

    // Em vez de usar fs.createWriteStream, redirecione o conteúdo diretamente para a resposta
    downloadLink.pipe(res);

    // Quando o download estiver completo, envie uma resposta JSON com o link de download
    res.on('finish', () => {
      const jsonResponse = {
        statusCode: 200,
        status: "sucesso",
        link: inf,
        downloadLink: `caminho/do/arquivo/${targetLink}`,  // Atualize o caminho conforme necessário
      };
      res.json(jsonResponse);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter informações do link Xvideos.' });
  }
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
