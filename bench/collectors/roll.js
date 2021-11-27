#!/usr/bin/env node

import http from 'http'
import { roll } from '@generates/roll'

const logger = roll.create({
  stdout: false,
  collectors: [
    { collector: import('@generates/roll-sentry'), opts: { level: 'error' } },
    { collector: import('@generates/roll-logtail') }
  ]
})

const server = http.createServer(function (req, res) {
  logger.info(`${req.method} ${req.url} Request`)
  res.end('Hello')
  logger.info(`${req.method} ${req.url} ${res.statusCode} Response`)
})

server.listen(3000)
