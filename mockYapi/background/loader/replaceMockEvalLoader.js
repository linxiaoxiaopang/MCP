// replace-mock-eval-loader.js
module.exports = function (source) {
  // 匹配 MockJS 中使用 eval 解析参数的代码段
  const evalRegex = /params\s*=\s*eval\(\s*'\(function\(\)\{ return \[\]\.splice\.call\(arguments, 0 \) \}\)\(' \+ params \+ '\)'\s*\)/g
  // 替换为安全的参数解析逻辑（使用 JSON.parse + 包装数组）
  const replacedSource = source.replace(evalRegex, function (match) {
    return `params = (function(str) {
      // 用 JSON.parse 解析参数（需确保参数格式为合法 JSON）
       return JSON.parse('[' + str + ']');
    })(params);`
  })

  return replacedSource
}
