import dotenv from 'dotenv'
import { roll } from '@generates/roll'
import rollLogzio from '../../index.js'

dotenv.config()

const logger = roll.create({
  collectors: [
    { collector: rollLogzio }
  ]
})

export default function () {
  logger.success('Successfully registered user', {
    name: 'Coraline',
    email: 'ghost@example.com',
    profile: {
      id: 456,
      isPublic: true,
      username: 'themanintheredjacket',
      bio: 'Blah blah blah.'
    }
  })
}
