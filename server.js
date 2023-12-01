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


app.get('/xvideos/:link', async (req, res) => {
  // Obtém o link da solicitação
  const targetLink = req.params.link;

  // Verifica se o link foi fornecido
  if (!targetLink || targetLink.trim() === '') {
    const jsonResponse = {
      statusCode: 401,
      status: 'Erro, verifique seu link',
    };
    res.status(401).json(jsonResponse);
  } else {
    // Obtém informações usando o módulo XVDL
    XVDL.getInfo(targetLink).then((inf) => {
      console.log(targetLink);

      // Pode descomentar a linha abaixo para baixar o vídeo (requer fs)
      // XVDL.download(targetLink, { type: 'hq' }).pipe(fs.createWriteStream(filePath));

      // Cria a resposta JSON com informações relevantes
      const jsonResponse = {
        statusCode: 200,
        status: 'sucesso',
        thumb: inf.thumbnail,
        titulo: inf.title,
        link: inf.streams.hq,
      };

      // Envia a resposta JSON
      res.json(jsonResponse);
    });
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
