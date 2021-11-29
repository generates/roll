import { merge } from '@generates/merger'
import _stringify from './lib/stringify.js'
import _prettify from './lib/prettify.js'

export const stringify = _stringify
export const prettify = _prettify

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
    if (opts.collectors) {
      const imports = []
      const opts = []
      this.collectors = []
      for (const c of opts.collectors) {
        if (c.collector.then) {
          imports.push(c.collector)
          opts.push(c.opts)
        } else {
          this.collectors.push(c.collector(c.opts))
        }
      }
      if (imports.length) {
        return Promise.all(imports).then(collectors => {
          for (const [index, collector] of collectors.entries()) {
            this.collectors.push(collector(opts[index]))
          }
          return logger
        })
      }
    }

    //
    return logger
  },
  ns (name, options) {
    //
    this.namespace = name

    //
    return this.create(options)
  },
  getLog (items) {
    const log = {}
    for (const item of items) {
      if (typeof item === 'string' && !log.message) {
        //
        log.message = item
      } else if (item instanceof Error) {
        const { stack, ...err } = item

        //
        log.isError = true

        if (log.message) {
          //
          log.error = stack
        } else {
          //
          log.message = stack
        }

        //
        log.data = merge(log.data || {}, err)
      } else if (typeof item === 'object') {
        log.data = merge(log.data || {}, item)
      }
    }
    return log
  },
  getOutput (type, items) {
    const { message, ...log } = this.getLog(items)
    if (this.opts.ndjson) {
      return JSON.stringify({
        ...this.namespace ? { namespace: this.namespace } : {},
        type: type.type,
        level: type.level,
        message,
        ...log
      })
    } else if (this.opts.pretty) {
      // TODO: Swap stringify for prettify.
      // TODO: Modify prettify to rewrite message if from error.
      let output = '    ' + message + '\n'
      if (log.data) output += prettify(log.data) + '\n'
      return output
    }
    // TODO:
    let output = message.replace(nlRe, ' ')
    if (log.data) {
      output += ' ' + stringify(log.data, undefined, '').replace(nlRe, ' ')
    }
    return output + '\n'
  },
  out (type, items) {
    let log
    if (this.collectors) {
      log = this.getLog(items)
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

addTypes(roll)
