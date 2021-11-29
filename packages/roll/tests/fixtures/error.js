export default function (logger) {
  const err = new Error('Woke up with my toolie what it do')
  err.where = 'Alley'
  err.with = 'The troops'
  logger.error(err)
}
