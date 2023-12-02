const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const ipinfo = require('ipinfo');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

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

function checkXvideosUrl(url) {
  const lowercaseUrl = url.toLowerCase();
  const patterns = ["www.xvideos.com", "xvideos.com"];

  return patterns.some(pattern => lowercaseUrl.includes(pattern));
}

app.get('/xvideos', async (req, res) => {
  const { XVDL } = require("./xvdl/index");
  const targetLink = req.query.url;

  if (targetLink && targetLink.trim() !== '') {
    if (checkXvideosUrl(targetLink)) {
      try {
        const inf = await XVDL.getInfo(targetLink);
        const jsonResponse = {
          statusCode: 200,
          status: "sucesso",
          thumb: inf.thumbnail,
          titulo: inf.title,
          link: inf.streams.hq,
        };
        res.json(jsonResponse);
      } catch (error) {
        const jsonResponse = {
          statusCode: 500,
          status: "Erro ao obter informações do Xvideos",
        };
        res.status(500).json(jsonResponse);
      }
    } else {
      const jsonResponse = {
        statusCode: 401,
        status: "Link não autorizado, verifique seu link do Xvideos",
      };
      res.status(401).json(jsonResponse);
    }
  } else {
    const jsonResponse = {
      statusCode: 401,
      status: "Unauthorized, check your link",
    };
    res.status(401).json(jsonResponse);
  }
});

app.get('/ip/:ipAddress', async (req, res) => {
  const targetIP = req.params.ipAddress ? req.params.ipAddress.trim() : obterEnderecoIp(req);

  try {
    const data = await ipinfo(targetIP);
    delete data.readme;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter informações do IP específico.' });
  }
});

app.get('/ip', async (req, res) => {
  const targetIP = obterEnderecoIp(req);

  try {
    const data = await ipinfo(targetIP);
    delete data.readme;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter informações do IP padrão.' });
  }
});

// Evento de conexão Socket.io
io.on('connection', (socket) => {
  console.log('Usuário conectado');

  // Evento de mensagem
  socket.on('chat message', (msg) => {
    console.log(`Mensagem recebida: ${msg}`);

    // Enviando a mensagem para todos os clientes conectados
    io.emit('chat message', msg);
  });

  // Desconexão de socket
  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});

// A rota /websocket lida apenas com conexões Socket.io
app.get('/websocket', (req, res) => {
  res.status(200).send('Socket.io endpoint');
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});
