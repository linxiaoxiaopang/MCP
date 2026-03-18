import { MockClass } from './mockClass'
// import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
// import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import * as z from 'zod/v4'

const instance = new MockClass()



// console.log('McpServer', McpServer)
// const server = new McpServer(
//   {
//     name: 'yApiMock',
//     version: '1.0.0'
//   },
//   {
//     capabilities: {
//       tools: {}
//     }
//   }
// )
//
// server.registerTool(
//   'yApiMock',
//   {
//     description: 'answer hello',
//     inputSchema: z.object({
//       url: z.string().describe('Yapi url'),
//       projectId: z.number().describe('Yapi project id')
//     })
//   },
//   async (data) => {
//     const res = await instance.getYApiData({
//       data
//     })
//     return {
//       content: [
//         {
//           type: 'text',
//           text: JSON.stringify(res || {})
//         }
//       ]
//     }
//   })


async function main() {
  await instance.getYApiData({
    data: {
      url: '/business/productService/skuMapping/list',
      projectId: 488
    }
  })
  // const transport = new StdioServerTransport()
  // await server.connect(transport)
  // console.log('MCP server is running...')
}

(async function () {
  try {
    await main()
  } catch (error) {
    console.error('Server error:', error)
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  }
}())
