#!/usr/bin/env node

import http from 'http'
import pino from 'pino'

const logger = pino()

const server = http.createServer(function (req, res) {
  logger.info(`${req.method} ${req.url} Request`)
  res.end('Hello')
  logger.info(`${req.method} ${req.url} ${res.statusCode} Response`)
})

server.listen(3000)
