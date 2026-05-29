import axios from 'axios'
import Mock from 'mockjs'

import {
  createFormByDeepMapData,
  fillForeignKeyList, formatMockData,
  getMockjsSyntax
} from './utils'

let cookieList = []
const service = axios.create({
  baseURL: 'http://192.168.10.245:3000'
})

export class MockClass {
  constructor() {

  }

  parseUrl(url) {
    const match = url.match(/project\/(\d+)\/interface\/api\/(\d+)/)
    if (!match) throw 'URL格式不正确，应为 /project/{projectId}/interface/api/{interfaceId}'
    return {
      projectId: match[1],
      interfaceId: match[2]
    }
  }

  createMockData(mockDescribeJson) {
    const form = createFormByDeepMapData(mockDescribeJson)
    const foreignKeyList = []
    const syntaxRes = getMockjsSyntax(form, foreignKeyList)
    const mockRes = Mock.mock(syntaxRes)
    formatMockData(mockRes)
    fillForeignKeyList(mockRes, foreignKeyList)
    console.log('mockRes', mockRes)
    return mockRes
  }

  async getBody(id) {
    const res = await service({
      url: `/api/interface/get?id=${id}`,
      method: 'get',
      headers: {
        Cookie: cookieList.join(';')
      }
    })
    return this.handleAxiosData(res)
  }

  async mockYApiData(request) {
    try {
      let { url } = request.data
      let interfaceId = null
      if (url) {
        const parsed = this.parseUrl(url)
        interfaceId = parsed.interfaceId
      }
      await this.login()
      const data = await this.getBody(interfaceId)
      const mockDescribeJson = JSON.parse(data.res_body || '{}')
      const mockRes = this.createMockData(mockDescribeJson)
      return this.formatMockRes(mockRes, request.data)
    } catch (err) {
      console.log('err', err)
      return {
        code: 0,
        message: err
      }
    }
  }

  async getYApiData(request) {
    try {
      let { url } = request.data
      let interfaceId = null
      if (url) {
        const parsed = this.parseUrl(url)
        interfaceId = parsed.interfaceId
      }
      await this.login()
      return await this.getBody(interfaceId)
    } catch (err) {
      console.log('err', err)
      return {
        code: 0,
        message: err
      }
    }
  }

  formatMockRes(mockRes, requestData) {
    mockRes.message = ''
    mockRes.detailMessage = ''
    mockRes.code = 0
    if (mockRes.page && requestData.data && requestData.data.page) {
      mockRes.page.pageIndex = requestData.data.page.pageIndex
      mockRes.page.pageSize = requestData.data.page.pageSize
      if (mockRes.data.length <= mockRes.page.pageSize) {
        mockRes.page.total = mockRes.data.length
      }
    }
    return mockRes
  }


  handleAxiosData(res) {
    if (res.status !== 200) throw res.status
    if (res.data && res.data.errcode !== 0) {
      const errcode = res && res.data && res.data.errcode || '未知'
      const errmsg = res && res.data && res.data.errmsg || '异常'
      throw `${errcode}:${errmsg}`
    }
    return res.data.data
  }

  async login() {
    const res = await service({
      method: 'POST',
      url: '/api/user/login',
      data: {
        email: '541953126@qq.com',
        password: 'Test123456'
      }
    })
    const resData = await this.handleAxiosData(res)
    cookieList = res.headers['set-cookie']
    return resData
  }
}



