#!/usr/bin/env node

import http from 'http'
import { roll } from '@generates/roll'

const server = http.createServer(function (req, res) {
  roll.info(`${req.method} ${req.url} Request`)
  res.end('Hello')
  roll.info(`${req.method} ${req.url} ${res.statusCode} Response`)
})

server.listen(3000)
