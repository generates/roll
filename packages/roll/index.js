import { merge } from '@generates/merger'

const defaults = {
  level: 'info',
  stdout: process.stdout.write.bind(process.stdout),
  collectors: false
}

export const types = [
  // For debugging code through log statements.
  { type: 'debug', level: 'debug', prefix: '🐛', style: ['magenta'] },
  // For standard log statements.
  { type: 'info', level: 'info', prefix: '💁', style: ['cyan', 'bold'] },
  // For general log statements in which you can customize the emoji.
  // { type: 'log', level: 'info', prefix: extractLogPrefix },
  // For log statements indicating a successful operation.
  { type: 'success', level: 'info', prefix: '✅', style: ['green', 'bold'] },
  // For the gray area between info and error.
  { type: 'warn', level: 'warn', prefix: '⚠️', style: ['yellow', 'bold'] },
  // For normal errors.
  { type: 'error', level: 'error', prefix: '🚫', style: ['red', 'bold'] },
  // For unrecoverable errors.
  { type: 'fatal', level: 'fatal', prefix: '💀', style: ['red', 'bold'] }
]

export function addTypes (logger, typesToAdd = types) {
  for (const type of typesToAdd) {
    logger[type.type] = function (...items) {
      this.name = type.type
      return this.out(type, items)
    }
  }
}

export const roll = {
  opts: merge({}, defaults),
  create (opts) {
    //
    const logger = merge({}, this, { opts })

    //
    if (opts.types) addTypes(logger, opts.types)

    //
    return logger
  },
  ns (name, options) {
    //
    this.namespace = name

    //
    return this.create(options)
  },
  out (type, items) {
    let message
    if (this.opts.stdout || this.collectors) {
      message = items[0] + '\n'
    }
    if (this.collectors) {
      // TODO:
    }
    if (this.opts.stdout) {
      return new Promise(resolve => this.opts.stdout(message, resolve))
    }
  }
}

addTypes(roll)
