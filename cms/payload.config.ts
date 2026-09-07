import { buildConfig } from 'payload/config'
import Projects from './collections/Projects'
import Events from './collections/Events'
import Locations from './collections/Locations'

export default buildConfig({
  serverURL: process.env.PAYLOAD_SERVER_URL || 'http://localhost:3001',
  mongoURL: process.env.MONGODB_URI,
  secret: process.env.PAYLOAD_SECRET,
  local: false,
  collections: [Projects, Events, Locations],
  admin: {
    user: 'users',
    disable: false,
    meta: {
      title: 'Payload CMS'
    },
    // i18n/localization
    // Enable locales via env or hard-code below
    // locales: ['en', 'uk'],
    // defaultLocale: 'en',
  }
})
