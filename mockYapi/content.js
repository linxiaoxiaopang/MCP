sessionStorage.setItem('use_auto_mock_data', true)
window.addEventListener('message', function (evt) {
  const { type } = evt.data
  if (type !== 'usedMock') return
  chrome.runtime.sendMessage(
    {
      action: 'getMockData',  // 消息类型（自定义）
      data: evt.data.data   // 携带参数
    },
    (response) => {  // 接收 background 的响应
      if (chrome.runtime.lastError) {
        window.postMessage({
          type: 'getMockData',
          data: {
            code: 0,
            message: '通信失败'
          }
        })
        return
      }
      // 处理响应数据（如更新页面DOM）
      window.postMessage({
        type: 'getMockData',
        data: response
      })
    }
  )
  console.log('evt', evt)
})

