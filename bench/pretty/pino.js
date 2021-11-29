#!/usr/bin/env node

import http from 'http'
import pino from 'pino'

const logger = pino()

const server = http.createServer(function (req, res) {
  logger.info(
    { method: req.method, url: req.url, headers: req.headers },
    'Request'
  )
  res.end('Hello')
  logger.info(
    { method: req.method, url: req.url, statusCode: res.statusCode },
    'Response'
  )
})

server.listen(3000)
