const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const ipinfo = require('ipinfo');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const cors = require('cors');

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: '*',
  methods: 'GET',
};

app.use(cors(corsOptions));

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


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  const enderecoIp = obterEnderecoIp(req);
  res.json({ enderecoIp });
});


app.get('/rtc', (req, res) => {
  res.sendFile(__dirname + '/webrtc.html');
});

app.get('/web', (req, res) => {
  res.sendFile(__dirname + '/xvideos.html');
});


app.get('/websocketversao', async (req, res) => {
  try {
    const response = await fetch('https://texter.viniciusdev.com.br/visualizar-raw/656cb5f205e6d');
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    const data = await response.text();
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao obter os dados.');
  }
});

function checkXvideosUrl(url) {
  const lowercaseUrl = url.toLowerCase();

  // Lista de padrões de URLs do Xvideos
  const xvideosPatterns = ["www.xvideos.com", "xvideos.com"];

  // Verifica se a URL contém algum padrão do Xvideos
  const isXvideos = xvideosPatterns.some(pattern => lowercaseUrl.includes(pattern));

  // Retorna verdadeiro se a URL corresponder a um padrão do Xvideos, caso contrário, retorna falso
  return isXvideos;
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
    //connections.delete(ws);
  });
});






/*
Video Broadcast
*/




// Rota principal
app.get('/websocket', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});