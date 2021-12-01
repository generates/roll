import { merge } from '@generates/merger'
import _stringify from './lib/stringify.js'
import _prettify from './lib/prettify.js'

export { default as kleur } from 'kleur'
export const stringify = _stringify
export const prettify = _prettify

const levels = [
  'debug',
  'info',
  'warn',
  'error'
]
const nlRe = /\n(\s+)?/g
const defaults = {
  level: 'info',
  stdout: process.stdout.write.bind(process.stdout),
  collectors: false,
  ndjson: false,
  pretty: !process.env.NODE_ENV && process.stdout.isTTY
}

export const types = [
  // For debugging code through log statements.
  { type: 'debug', level: 'debug', prefix: '🐛', style: ['magenta'] },
  // For standard log statements.
  { type: 'info', level: 'info', prefix: '💁', style: ['cyan', 'bold'] },
  // For general log statements in which you can customize the emoji.
  { type: 'log', level: 'info', prefix: false },
  // For log statements indicating a successful operation.
  { type: 'success', level: 'info', prefix: '✅', style: ['green', 'bold'] },
  // For the gray area between info and error.
  { type: 'warn', level: 'warn', prefix: '⚠️', style: ['yellow', 'bold'] },
  // For normal errors.
  { type: 'error', level: 'error', prefix: '🚫', style: ['red', 'bold'] },
  // For unrecoverable errors.
  { type: 'fatal', level: 'error', prefix: '💀', style: ['red', 'bold'] }
]

export function addTypes (logger, typesToAdd = types) {
  for (const type of typesToAdd) {
    logger[type.type] = function (...items) {
      this.name = type.type
      return this.out(type, items)
    }
  }
}

export function mergeExtra (items) {
  const data = {}
  for (const item of items) {
    if (typeof item === 'string') {
      if (data.messages) {
        data.messages.push(item)
      } else {
        data.messages = [item]
      }
    } else if (typeof item === 'object') {
      merge(data, item)
    }
  }
  return data
}

export const roll = {
  opts: merge({}, defaults),
  create (opts = {}) {
    // Create a new logger instance by merging the current logger with the
    // passed options.
    const logger = merge({}, this, { opts })

    // If different log types were passed, add them to the logger.
    if (opts.types) addTypes(logger, opts.types)

    // If collectors were passed, add them into the logger's collectors array.
    if (opts.collectors) {
      const imports = []
      const importsOpts = []
      logger.collectors = []
      for (const c of opts.collectors) {
        if (c.collector.then) {
          imports.push(c.collector)
          importsOpts.push(c.opts)
        } else {
          logger.collectors.push(c.collector(c.opts))
        }
      }

      // Return a promise if the collector imports are dynamic.
      if (imports.length) {
        return Promise.all(imports).then(collectors => {
          for (const [index, collector] of collectors.entries()) {
            logger.collectors.push(collector(importsOpts[index]))
          }
          return logger
        })
      }
    }

    return logger
  },
  ns (namespace, options) {
    return this.create({ namespace, ...options })
  },
  getLog (type, items) {
    const log = { type: type.type, level: type.level }
    for (const item of items) {
      if (typeof item === 'string') {
        if (log.message) {
          if (log.extra) {
            log.extra.push(item)
          } else {
            log.extra = [item]
          }
        } else {
          log.message = item
        }
      } else if (item instanceof Error) {
        const { stack, ...err } = item

        if (log.message) {
          // If there is already a log message, add the error stack to an
          // 'error' property.
          log.error = stack
        } else {
          // Use the error stack as the log message.
          log.message = stack
        }

        // If there are additional properties from the error, add them to the
        // extra array on the log object.
        if (Object.keys(err).length) {
          if (log.extra) {
            log.extra.push(err)
          } else {
            log.extra = [err]
          }
        }
      } else if (typeof item === 'object') {
        if (log.extra) {
          log.extra.push(item)
        } else {
          log.extra = [item]
        }
      }
    }
    return log
  },
  getOutput (type, items) {
    const { message, extra, ...log } = this.getLog(type, items)
    if (this.opts.ndjson) {
      return JSON.stringify({
        ...this.opts.namespace ? { namespace: this.opts.namespace } : {},
        message,
        ...log,
        ...extra ? { data: mergeExtra(extra) } : {}
      })
    } else if (this.opts.pretty) {
      let output = '    ' + message + '\n'
      if (extra) {
        for (const item of extra) {
          if (typeof item === 'string') {
            output += '    ' + item + '\n'
          } else if (typeof item === 'object') {
            output += prettify(item) + '\n'
          }
        }
      }
      return output
    }
    let output = message.replace(nlRe, ' ')
    if (extra) {
      for (const item of extra) {
        if (typeof item === 'string') {
          output += item + ' '
        } else if (typeof item === 'object') {
          output += stringify(item, undefined, '').replace(nlRe, ' ')
        }
      }
    }
    return output + '\n'
  },
  out (type, items) {
    const index = levels.indexOf(type.level)
    const optIndex = levels.indexOf(this.opts.level)
    if (index >= optIndex) {
      let log
      if (this.collectors) {
        log = this.getLog(type, items)
        for (const collector of this.collectors) collector(log)
      }
      if (this.opts.stdout) {
        const output = this.getOutput(type, items)
        if (output) {
          return new Promise(resolve => this.opts.stdout(output, () => {
            resolve(output)
          }))
        }
      }
      return log
    }
  }
}

addTypes(roll)
