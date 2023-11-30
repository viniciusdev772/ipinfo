// middlewares/obterEnderecoIpMiddleware.js

function obterEnderecoIpMiddleware(req, res, next) {
    if (req.headers['cf-connecting-ip']) {
      req.enderecoIp = req.headers['cf-connecting-ip'];
    } else if (req.headers['x-forwarded-for']) {
      req.enderecoIp = req.headers['x-forwarded-for'];
    } else {
      req.enderecoIp = req.ip;
    }
    next();
  }
  
  module.exports = obterEnderecoIpMiddleware;
  