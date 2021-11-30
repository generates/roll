import logzio from 'logzio-nodejs'

const logger = logzio.createLogger({
  token: process.env.LOGZIO_TOKEN,
  protocol: 'https',
  host: 'listener.logz.io',
  port: '8071'
})

export default function logzioCollector () {
  return function logzioCollect (log) {
    logger.log(log)
    logger.sendAndClose()
  }
}
