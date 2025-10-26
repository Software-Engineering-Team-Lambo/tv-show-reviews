import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/', async function () {
    return { root: true }
  })

  fastify.get('/health', async function () {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })
}

export default root
