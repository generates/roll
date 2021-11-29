#!/usr/bin/env node

import http from 'http'
import winston from 'winston'
import rollSentry from '@generates/roll-sentry'

const logger = winston.createLogger({
  transports: [
    rollSentry()
  ]
})

const server = http.createServer(function (req, res) {
  logger.info(`${req.method} ${req.url} Request`)
  res.end('Hello')
  logger.info(`${req.method} ${req.url} ${res.statusCode} Response`)
})

server.listen(3000)
