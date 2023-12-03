const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const ipinfo = require('ipinfo');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = process.env.PORT || 3000;

function obterEnderecoIp(req) {
  let enderecoIp;

  if (req.headers['cf-connecting-ip']) {
    enderecoIp = req.headers['cf-connecting-ip'];
  } else if (req.headers['x-forwarded-for']) {
    enderecoIp = req.headers['x-forwarded-for'];
  } else {
    enderecoIp = req.ip;
  }

  return enderecoIp;
}

app.get('/', async (req, res) => {
  const enderecoIp = obterEnderecoIp(req);
  res.json({ enderecoIp });
});

app.get('/websocketversao', async (req, res) => {
  res.send(1);
});

function checkXvideosUrl(url) {
  const lowercaseUrl = url.toLowerCase();
  const patterns = ["www.xvideos.com", "xvideos.com"];

  for (const pattern of patterns) {
    if (lowercaseUrl.includes(pattern)) {
      return true;
    }
  }

  return false;
}

app.get('/xvideos', (req, res) => {
  const { XVDL } = require("./xvdl/index");
  const targetLink = req.query.url;

  if (targetLink && targetLink.trim() !== '') {
    if (checkXvideosUrl(targetLink)) {
      XVDL.getInfo(targetLink).then((inf) => {
        const jsonResponse = {
          statusCode: 200,
          status: "sucesso",
          thumb: inf.thumbnail,
          titulo: inf.title,
          link: inf.streams.hq,
        };
        res.json(jsonResponse);
      });
    } else {
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

app.get('/ip/:ipAddress', async (req, res) => {
  let targetIP;

  if (req.params.ipAddress && req.params.ipAddress.trim() !== '') {
    targetIP = req.params.ipAddress.trim();
  } else {
    targetIP = obterEnderecoIp(req);
  }

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

app.get('/ip', async (req, res) => {
  const targetIP = obterEnderecoIp(req);

  ipinfo(targetIP, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao obter informações do IP padrão.' });
    } else {
      delete data.readme;
      res.json(data);
    }
  });
});

// Evento de conexão WebSocket
const connections = new Set();

wss.on('connection', (ws,req) => {
  console.log('Conexão WebSocket estabelecida.');
  const enderecoIp = obterEnderecoIp(req);
  console.log(`Nova conexão WebSocket do IP: ${enderecoIp}`);
  // Adicionar a nova conexão ao conjunto
  connections.add(ws);

  ws.on('message', (message) => {
    console.log(`Mensagem WebSocket recebida: ${message}`);

    // Enviar a mensagem para todos os clientes conectados, exceto o remetente
    connections.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`Nova Mensagem do endereço IP: ${enderecoIp} : ${message}`);
      }
    });
  });

  ws.on('close', () => {
    console.log('Conexão WebSocket fechada.');

    // Remover a conexão do conjunto ao fechar
    connections.delete(ws);
  });
});

// A rota /websocket lida apenas com conexões WebSocket
app.use(express.static(__dirname));

// Rota principal
app.get('/websocket', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});