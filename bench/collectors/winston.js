#!/usr/bin/env node

import http from 'http'
import winston from 'winston'
import rollLogzio from '@generates/roll-logzio'

const logger = winston.createLogger({
  transports: [
    rollLogzio()
  ]
})

const server = http.createServer(function (req, res) {
  logger.info(`${req.method} ${req.url} Request`)
  res.end('Hello')
  logger.info(`${req.method} ${req.url} ${res.statusCode} Response`)
})

server.listen(3000)
