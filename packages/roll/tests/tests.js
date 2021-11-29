import { test } from '@ianwalter/bff'
import { roll } from '../index.js'
import hello from './fixtures/hello.js'
import error from './fixtures/error.js'

test('Log info string to stdout', t => {
  const logger = roll.create({
    stdout: output => t.expect(output).toMatchSnapshot()
  })
  hello(logger)
})

test('Log error to stdout', t => {
  const logger = roll.create({
    stdout: output => t.expect(output).toMatchSnapshot()
  })
  error(logger)
})
