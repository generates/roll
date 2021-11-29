#!/usr/bin/env node

import http from 'http'
import { roll } from '@generates/roll'

const logger = roll.create({ pretty: true })

const server = http.createServer(function (req, res) {
  logger.info(
    'Request',
    { method: req.method, url: req.url, headers: req.headers }
  )
  res.end('Hello')
  logger.info(
    'Response',
    { method: req.method, url: req.url, statusCode: res.statusCode }
  )
})

server.listen(3000)
