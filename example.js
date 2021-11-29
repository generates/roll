#!/usr/bin/env node

import path from 'path'
import { roll } from '@generates/roll'

import(path.resolve(process.argv.slice(2).pop())).then(({ default: log }) => {
  const logger = roll.create({ pretty: false })
  log(logger)
})
