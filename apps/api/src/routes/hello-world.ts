import { FastifyPluginAsync } from 'fastify'

// this is just a demo route, you can delete it
// just so you know how to add routes and how it works with the web app
const helloWorld: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/api/hello-world', async function (request, reply) {
    return { hello: 'world' }
  })
}

export default helloWorld
