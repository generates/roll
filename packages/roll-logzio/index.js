import logzio from 'logzio-nodejs'
import { merge } from '@generates/merger'
import { mergeExtra } from '@generates/roll'

const defaults = {
  sendAndClose: true
}

const logger = logzio.createLogger({
  token: process.env.LOGZIO_TOKEN,
  protocol: 'https',
  host: 'listener.logz.io',
  port: '8071'
})

export default function logzioCollector (opts) {
  this.opts = merge({}, defaults, opts)
  return function logzioCollect ({ extra, ...log }) {
    logger.log({ log, ...extra ? { data: mergeExtra(extra) } : {} })
    if (this.opts.sendAndClose) logger.sendAndClose()
  }
}
