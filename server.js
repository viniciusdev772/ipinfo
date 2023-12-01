const express = require('express');
const app = express();
const ipinfo = require('ipinfo');
const port = process.env.PORT || 3000;

// Função para obter o endereço IP
function obterEnderecoIp(req) {
  let enderecoIp;

  if (req.headers['cf-connecting-ip']) {
    // Se estiver passando pelo Cloudflare
    enderecoIp = req.headers['cf-connecting-ip'];
  } else if (req.headers['x-forwarded-for']) {
    // Se não estiver passando pelo Cloudflare, mas estiver usando um proxy
    enderecoIp = req.headers['x-forwarded-for'];
  } else {
    // Caso contrário, obtém o IP diretamente
    enderecoIp = req.ip;
  }

  return enderecoIp;
}

// Rota principal
app.get('/', async (req, res) => {
  const enderecoIp = obterEnderecoIp(req);
  res.json({ enderecoIp });
});


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


app.get('/xvideos',  (req, res) => {
  const { XVDL } = require("./xvdl/index");
  const targetLink = req.query.url;

  if (targetLink && targetLink.trim() !== '') {
    

    if(checkXvideosUrl(targetLink)){
      XVDL.getInfo(targetLink).then((inf) => {
        const jsonResponse = {
          statusCode: 200,
          status: "sucesso",
          thumb : inf.thumbnail,
          titulo : inf.title,
          link: inf.streams.hq,
        };
        res.json(jsonResponse);
      });
    }else{
      const jsonResponse = {
        statusCode: 401,
        status: "Link não Autorizado, Verifique seu Link do Xvideos",
      };
      res.status(401).json(jsonResponse);
    }
  } else {
    const jsonResponse = {
      statusCode: 401,
      status: "Unauthorized, Check your link",
    };
    res.status(401).json(jsonResponse);
  }
});

// Rota para obter informações do IP
app.get('/ip/:ipAddress', async (req, res) => {
  let targetIP;

  // Verificar se req.params.ipAddress não é vazia
  if (req.params.ipAddress && req.params.ipAddress.trim() !== '') {
    // Se não for vazia, use o IP inserido
    targetIP = req.params.ipAddress.trim(); // Substitua pelo IP desejado
  } else {
    // Caso contrário, use a função para obter o IP
    targetIP = obterEnderecoIp(req);
  }

  ipinfo(targetIP, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao obter informações do IP específico.' });
    } else {
      // Remover a propriedade readme do objeto de resposta
      delete data.readme;
      res.json(data);
    }
  });
});

// Rota para obter informações do IP padrão
app.get('/ip', async (req, res) => {
  // Chamar a função para obter o IP padrão
  const targetIP = obterEnderecoIp(req);

  ipinfo(targetIP, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao obter informações do IP padrão.' });
    } else {
      // Remover a propriedade readme do objeto de resposta
      delete data.readme;
      res.json(data);
    }
  });
});

// Inicia o servidor
app.listen(port, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});
