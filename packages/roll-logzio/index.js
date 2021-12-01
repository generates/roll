import logzio from 'logzio-nodejs'
import { merge } from '@generates/merger'

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
  return function logzioCollect (log) {
    logger.log(log)
    if (this.opts.sendAndClose) logger.sendAndClose()
  }
}
