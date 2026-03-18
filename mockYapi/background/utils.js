import { dicOfString } from './const'
import './extend/index'
import {
  flatMapDeep, get, merge, isArray,
  toLower, forEach, isObject, every, uniq, isPlainObject
} from 'lodash'


const DEFAULT_ARRAY_COUNT = '1-10'

export function createFormByDeepMapData(data, prop) {
  let tmp = null
  if (data.type === 'object') {
    tmp = {}
    const keys = Object.keys(data.properties)
    for (let key of keys) {
      const val = data.properties[key]
      tmp[key] = createFormByDeepMapData(val, key)
    }
    defineDatabaseType(tmp, 'object')
  } else if (data.type === 'array') {
    if (!data.items.properties) {
      data.items.description = data.description
      data.items.notObjectItem = true
    }
    const res = createFormByDeepMapData(data.items, prop)
    defineDatabaseType(res, 'array')
    if (!data.items.properties) {
      defineDatabaseType(res, true, 'notObjectArray')
      data.items.description = data.description
    }
    defineDatabaseType(res, DEFAULT_ARRAY_COUNT, 'arrayCount')
    tmp = res
  } else {
    tmp = formatVal(data, prop)
  }
  return tmp
}

const list = {
  integer(row, key) {
    const tmpObj = list.default(row, key)
    tmpObj.mValue = '@integer(1, 100)'
    const descriptionData = analysisDescription(row.description)
    if (isForeignKey(row)) {
      tmpObj.mKey = `${key}|+1`
      tmpObj.mValue = '@integer(1, 200)'
      tmpObj.isForeignKey = true
    } else if (descriptionData && row.format === 'int32') {
      let argStr = JSON.stringify(descriptionData)
      tmpObj.mValue = `@pick(${argStr})`
    }
    return tmpObj
  },

  number(row, key) {
    const tmpObj = list.default(row, key)
    const { format } = row
    const formatList = {
      float: '@float(1, 100, 2, 2)',
      double: '@float(1, 100, 8, 8)'
    }
    tmpObj.mValue = formatList[format] || formatList.float
    return tmpObj
  },

  string(row, key) {
    const tmpObj = list.default(row, key)
    if (includesWords(key, 'time')) {
      tmpObj.mValue = '@datetime'
    } else if (includesWords(key, 'date')) {
      tmpObj.mValue = '@date'
    } else if (includesWords(key, ['path', 'url'])) {
      tmpObj.mValue = '@ossImage'
    } else if (includesWords(key, 'color')) {
      tmpObj.mValue = '@color'
    } else if (includesWords(key, 'email')) {
      tmpObj.mValue = '@email'
    } else if (includesWords(key, 'name')) {
      tmpObj.mValue = '@name'
    } else {
      tmpObj.mValue = '@string(10)'
    }
    return tmpObj
  },

  boolean(row, key) {
    const tmpObj = list.default(row, key)
    tmpObj.mValue = '@boolean' ? 1 : 0
    return tmpObj
  },

  array(row, key) {
    const tmpObj = list.default(row, key)
    tmpObj.mValue = `${key}|10-20`
    return tmpObj
  },

  default(row, key) {
    defineDatabaseType(row, row.type)
    const res = {
      key,
      mKey: key,
      mValue: row[key]
    }
    return res
  }
}

function formatVal(row, key) {
  const { type } = row
  row.key = key
  const fn = list[type] || list.default
  return merge(row, fn(row, key))
}

function splitWords(str) {
  if (!str) return []
  return str.split(/(?=[A-Z])/).map(toLower)
}

function includesWords(str, words) {
  if (!isArray(words)) words = [words]
  const words1 = splitWords(str)
  return words1.some(item => {
    return words.find(sItem => sItem == item)
  })
}

function analysisDescription(val, type = 'number') {
  const list = {
    number() {
      if (!val) return null
      return val.match(/\d+/g)
    }
  }
  return list[type]() || list.number()
}

export function defineDatabaseType(obj, value, prop = '__databaseType__') {
  return Object.defineProperty(obj, prop, {
    value,
    writable: true,
    configurable: true,
    enumerable: false
  })
}

export function getMockjsSyntax(data, keyList, parentPath = '') {
  if (data.__databaseType__ === 'object' || data.__databaseType__ === 'array' && !data.notObjectArray) {
    let option = {}
    const keys = Object.keys(data)
    for (let key of keys) {
      const val = data[key]
      let prop = val.mKey || key
      try {
        if (val.mValue.indexOf('@/') >= 0) {
          prop = key
        }
      } catch {
      }
      const curParentPath = parentPath ? `${parentPath}.${key}` : key
      if (val.__databaseType__ === 'array') {
        const suffix = val.arrayCount || '1-10'
        prop = `${prop}|${suffix}`
        option[prop] = [getMockjsSyntax(val, keyList, curParentPath)]
      } else {
        option[prop] = getMockjsSyntax(val, keyList, curParentPath)
      }
    }
    return option
  }
  if (data.isForeignKey && !data.mValue.startsWith('@')) {
    keyList.push({
      from: data.mValue,
      to: parentPath
    })
  }
  return data.mValue
}

export function createForeignKeyList(data, parentPath = '') {
  const tmpArr = []
  if (data.__databaseType__ === 'object' || data.__databaseType__ === 'array' && data.notObjectArray) {
    const keys = Object.keys(data)
    for (let key of keys) {
      const val = data[key]
      const curParentPath = `${parentPath}${key}.`
      tmpArr.push(...createForeignKeyList(val, curParentPath))
    }
  } else {
    if (isForeignKey(data)) {
      let label = `${parentPath}`
      label = label.slice(0, -1)
      tmpArr.push({
        label,
        value: label
      })
    }
  }
  return tmpArr
}

export function fillForeignKeyList(data, keyList) {
  keyList.map(({ from, to }) => {
    const { data: fromData, lastProp: fromLastProp } = getDataByProp(from)
    const { data: toData, lastProp: toLastProp } = getDataByProp(to)
    if (validatenull(fromData) || validatenull(toData)) return
    toData.map((toItem, index) => {
      try {
        let fromItem = fromData[index]
        if (fromData.length == 1) {
          fromItem = fromData[0]
        }
        toItem[toLastProp] = fromItem[fromLastProp]
      } catch (err) {
        toItem[toLastProp] = err.toString()
      }
    })
    // fromData.map((item, index) => {
    //   const toItem = toData[index]
    //   toItem[toLastProp] = item[fromLastProp]
    // })
  })

  function getDataByProp(prop) {
    const splitProps = prop.split('.')
    const lastProp = splitProps.pop()
    const flatData = flatMapDeepByArray(data, splitProps)
    return {
      data: flatData,
      lastProp
    }
  }
}

function isForeignKey(data) {
  try {
    return data.description && data.description.indexOf('主键') >= 0 || includesWords(data.key, 'id')
  } catch {
    return false
  }
}

const foreignKeyList = []

export function createFormColumns(data, prop) {
  let option = null
  if (!prop) {
    foreignKeyList.length = 0
    foreignKeyList.push({
      label: '@integer(1, 200)',
      value: '@integer(1, 200)'
    })
    foreignKeyList.push(...createForeignKeyList(data))
  }
  if (data.__databaseType__ === 'object' || data.__databaseType__ === 'array') {
    if (data.notObjectArray) {
      option = {
        prop,
        span: 6,
        slot: 'notObjectArray',
        label: data.mKey,
        databaseType: data.__databaseType__
      }
    } else {
      option = {
        prop,
        label: prop,
        span: 24,
        labelWidth: 'auto',
        slot: 'form',
        column: [],
        databaseType: data.__databaseType__
      }
      const keys = Object.keys(data)
      for (let key of keys) {
        const val = data[key]
        option.column.push(createFormColumns(val, key))
      }
    }
  } else if (data.__databaseType__ === 'array') {
    return createFormColumns(data, prop)
  } else {
    option = {
      prop,
      span: 6,
      label: data.mKey
    }
    if (data.__databaseType__ === 'string') {
      option.type = 'select'
      option.filterable = true
      option.dicData = dicOfString
    }
    if (isForeignKey(data) && data.__databaseType__ === 'integer') {
      option.type = 'select'
      option.filterable = true
      option.dicData = foreignKeyList
    }
  }
  return option
}

export function formatMockData(data) {
  deepTraverse(data, (item, key, value) => {
    uniqPrimitiveArray(value)
  })

  function uniqPrimitiveArray(value) {
    if (!isPrimitiveArray(value)) return
    const uniqVal = uniq(value)
    value.length = 0
    value.push(...uniqVal)
  }

  function isPrimitiveArray(value) {
    if (!isArray(value)) return false
    return every(value, isPrimitive)
  }
}

export function deepTraverse(value, callback) {
  if (isArray(value)) {
    // 遍历数组中的每个元素
    forEach(value, (item, index) => {
      callback(item, index, value) // 调用回调函数
      deepTraverse(item, callback) // 递归遍历子项
    })
  } else if (isObject(value)) {
    // 遍历对象中的每个键值对
    forEach(value, (item, key) => {
      callback(item, key, value) // 调用回调函数
      deepTraverse(item, callback) // 递归遍历子项
    })
  } else {
    // 对基础类型的值调用回调函数
    callback(value)
  }
}

function isPrimitive(value) {
  return value === null || (typeof value !== 'object' && typeof value !== 'function')
}

function validatenull(val) {
  if (val instanceof Date || ['boolean', 'number', 'function'].includes(typeof val)) return false
  if (val instanceof Array) {
    if (val.length === 0) return true
  } else if (val instanceof Object) {
    for (var o in val) {
      return false
    }
    return true
  } else {
    return val === 'null' ||
      val == null ||
      val === 'undefined' ||
      val === undefined ||
      val === ''
  }
  return false
}

function flatMapDeepByArray(data, mapArr = [], mapKeyArr = []) {
  let flatMapArr = []
  if (!mapArr.length) return []
  if (isPlainObject(data)) {
    const shiftData = data[mapArr.shift()]
    flatMapArr = Array.isArray(shiftData) ? shiftData : [shiftData]
  } else {
    flatMapArr = data
  }
  //重置mapKeyArr
  mapKeyArr = mapKeyArr.slice(0, flatMapArr.length)
  for (let i = 0; i < mapArr.length; i++) {
    flatMapArr = flatMapDeep(flatMapArr, (n) => {
      const arr = get(n, `${[mapArr[i]]}`, [])
      const sliceKeyArr = mapKeyArr.slice(0, i + 1)
      const sliceMapArr = mapArr.slice(0, i + 1)
      sliceKeyArr.map((key, k) => {
        arr.map((nItem, index) => {
          nItem.$index = index
          if (k == sliceMapArr.length - 1) {
            return (nItem[`$${key}`] = n)
          }
          nItem[`$${key}`] = n[`$${key}`]
        })
      })
      return arr
    })
  }
  //需要填充
  return flatMapArr
}
