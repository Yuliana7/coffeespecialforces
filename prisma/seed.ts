import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.location.create({
    data: {
      slug: 'kyiv',
      name: 'Kyiv',
      address: 'Kyiv, Ukraine',
      description: 'Main hub',
      projects: {
        create: [
          {
            slug: 'initial-campaign',
            status: 'active',
            translations: {
              create: [
                { locale: 'en', title: 'Initial Campaign', summary: 'Pilot campaign', content: 'Content in English' },
                { locale: 'uk', title: 'Початкова кампанія', summary: 'Пілотна кампанія', content: 'Контент українською' }
              ]
            }
          }
        ]
      },
      events: {
        create: [
          {
            slug: 'first-event',
            title: 'First Event',
            summary: 'Opening event',
            dateTime: new Date()
          }
        ]
      }
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
