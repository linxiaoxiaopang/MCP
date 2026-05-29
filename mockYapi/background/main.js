import { MockClass } from './mockClass'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import * as z from 'zod/v4'

const instance = new MockClass()


const server = new McpServer(
  {
    name: 'yApiMock',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

server.registerTool(
  'mockYApiData',
  {
    description: 'mock yApi data',
    inputSchema: z.object({
      url: z.string().describe('Yapi url')
    })
  },
  async (data) => {
    const res = await instance.mockYApiData({
      data
    })
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res || {})
        }
      ]
    }
  })

server.registerTool(
  'getYApiData',
  {
    description: 'get yApi data',
    inputSchema: z.object({
      url: z.string().describe('Yapi url')
    })
  },
  async (data) => {
    const res = await instance.getYApiData({
      data
    })
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(res || {})
        }
      ]
    }
  })

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.log('MCP server is running...')
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
