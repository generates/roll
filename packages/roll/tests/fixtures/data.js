export default function (logger) {
  logger.success('Successfully registered user', {
    name: 'Snake Hips',
    email: 'lovinu@example.com',
    profile: {
      id: 123,
      isPublic: true,
      username: 'snakehips',
      bio: 'I am a snake. My hips LIE.'
    }
  })
}
