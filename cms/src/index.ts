import express from 'express'
import payload from 'payload'
import path from 'path'

const start = async () => {
  const app = express()

  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'PAYLOADSECRET',
    mongoURL: process.env.MONGODB_URI,
    express: app,
    onInit: () => {
      const port = parseInt(process.env.PORT || '3001', 10)
      app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Payload CMS listening at http://localhost:${port}/admin`) 
      })
    }
  })
}

start().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
