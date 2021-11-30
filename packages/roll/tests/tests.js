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
    stdout: output => {
      t.expect(output).toContain('Woke up with my toolie what it do at default')
      t.expect(output).toContain('packages/roll/tests/fixtures/error.js:2:15')
    }
  })
  error(logger)
})
