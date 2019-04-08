console.log('这是content script!---------')

// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', function() {
  /* if(location.host.indexOf('www.kcs.top')<0){ */
  if (location.host.indexOf('www.gate.io') < 0) {
    return
  }
  initCustomPanel_msg()
  function check_login() {
    console.log('start -- check_login')
    var el = $('.ant-btn.kc-button.ant-btn-primary.ant-btn-lg')
    console.log(el)
    el.each(function(index, element) {
      initCustomPanel_login()
      msg_log += '还没有登录请登录！<br/>'
      $('#content_msg').html(msg_log)
    })
  }

  console.log('DOMContentLoaded -----------')
  var is_can_get = true
  var m = 0
  var msg_log = ''
  var exc_count = 0
  function findTime() {
    exc_count += 1
    console.log('------- findTime ---------')
    var t = ''
    /* var data = $('.down___2nGy1').find('.number___2pHVb:first')
		data.each(function(index,element){
			console.log($(element))
			var c = $(element).text()
			if (c != ''){
				t += c;
			}
			
		}) */
    var data = $('.point_ad_timer').find('> span')
    data.each(function(index, element) {
      var c = $(element).text()
      if (c != '') {
        t += c
      }
    })
    if (t != '') {
      if (parseInt(t) % 10 == 0) {
        msg_log += '倒计未结束，结束时自动点击购买<br/>'
        //tip("模拟倒计时结束，自动点击购买")
      } else {
        var amount = $('#sel_amount').val()
        msg_log += amount + ': 倒计时：' + t + '<br/>'
        //tip("倒计时检测："+t)
      }
      if (exc_count > 20) {
        exc_count = 0
        msg_log = ''
      }
      $('#content_msg').html(msg_log)
    } else {
      var amount = $('#sel_amount').val()
      click_get(amount)
    }
  }
  setInterval(findTime, 100)
  //findTime()

  function click_get(amount) {
    /* var amount = $('input[name="amount"]') */
    /* console.log(amount) */

    console.log('----- click_get ------')
    console.log(amount)
    /* console.log($('.submit.en-btn.bg-buy'))
		var login_btn = $('.submit.en-btn.bg-buy') */
    // if(login_btn.length>0){
    // 	tip('没有登录')
    // 	return
    // }
    /* var btn = $('.submit.bg-buy.0') */
    var btn = $('.point_package_right_bottom').eq(amount)
    btn.each(function(i, el) {
      console.log(el)
      $(el).trigger('click')
    })
  }

  function check_zige() {
    var el = $('.ant-btn.kc-button.ant-btn-grey.ant-btn-lg')
    if (el.length > 0) {
      alert('你没有资格抢购MTV!')
    }
  }

  //setTimeout(click_get,1000)

  //click_get()
  // 注入自定义JS
  injectCustomJs()
  setTimeout(check_login, 5000)
  //setTimeout(check_zige,5000)
})

function initCustomPanel_login() {
  var panel = document.createElement('div')
  panel.className = 'chrome-plugin-demo-panel'
  panel.innerHTML = `
		<h2>请先登录</h2>
		<div class="btn-area">
			请在活动开始前登录
		</div>
		<div id="my_custom_log">
		</div>
	`
  document.body.appendChild(panel)
}

function initCustomPanel_msg() {
  var panel = document.createElement('div')
  panel.className = 'chrome-plugin-demo-panel-msg'
  panel.innerHTML = `
		<h2>执行日志</h2>
		<select id="sel_amount">
			<option value="0">100</option>
			<option value="1">950</option>
			<option value="2">9200</option>
			<option value="3">90000</option>
		</select>
		<div class="btn-area" id="content_msg">
		</div>
		
	`
  document.body.appendChild(panel)
}

// 向页面注入JS
function injectCustomJs(jsPath) {
  jsPath = jsPath || 'js/inject.js'
  var temp = document.createElement('script')
  temp.setAttribute('type', 'text/javascript')
  // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
  temp.src = chrome.extension.getURL(jsPath)
  temp.onload = function() {
    // 放在页面不好看，执行完后移除掉
    this.parentNode.removeChild(this)
  }
  document.body.appendChild(temp)
}

// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(
    '收到来自 ' +
      (sender.tab
        ? 'content-script(' + sender.tab.url + ')'
        : 'popup或者background') +
      ' 的消息：',
    request
  )
  if (request.cmd == 'update_font_size') {
    var ele = document.createElement('style')
    ele.innerHTML = `* {font-size: ${request.size}px !important;}`
    document.head.appendChild(ele)
  } else {
    tip(JSON.stringify(request))
    sendResponse('我收到你的消息了：' + JSON.stringify(request))
  }
})

// 主动发送消息给后台
// 要演示此功能，请打开控制台主动执行sendMessageToBackground()
function sendMessageToBackground(message) {
  chrome.runtime.sendMessage(
    { greeting: message || '你好，我是content-script呀，我主动发消息给后台！' },
    function(response) {
      tip('收到来自后台的回复：' + response)
    }
  )
}

// 监听长连接
chrome.runtime.onConnect.addListener(function(port) {
  console.log(port)
  if (port.name == 'test-connect') {
    port.onMessage.addListener(function(msg) {
      console.log('收到长连接消息：', msg)
      tip('收到长连接消息：' + JSON.stringify(msg))
      if (msg.question == '你是谁啊？')
        port.postMessage({ answer: '我是你爸！' })
    })
  }
})

window.addEventListener(
  'message',
  function(e) {
    console.log('收到消息：', e.data)
    if (e.data && e.data.cmd == 'invoke') {
      eval('(' + e.data.code + ')')
    } else if (e.data && e.data.cmd == 'message') {
      tip(e.data.data)
    }
  },
  false
)

function initCustomEventListen() {
  var hiddenDiv = document.getElementById('myCustomEventDiv')
  if (!hiddenDiv) {
    hiddenDiv = document.createElement('div')
    hiddenDiv.style.display = 'none'
    hiddenDiv.id = 'myCustomEventDiv'
    document.body.appendChild(hiddenDiv)
  }
  hiddenDiv.addEventListener('myCustomEvent', function() {
    var eventData = document.getElementById('myCustomEventDiv').innerText
    tip('收到自定义事件：' + eventData)
  })
}

var tipCount = 0
// 简单的消息通知
function tip(info) {
  info = info || ''
  var ele = document.createElement('div')
  ele.className = 'chrome-plugin-simple-tip slideInLeft'
  ele.style.top = tipCount * 70 + 200 + 'px'
  ele.innerHTML = `<div>${info}</div>`
  document.body.appendChild(ele)
  ele.classList.add('animated')
  tipCount++
  setTimeout(() => {
    ele.style.top = '-100px'
    setTimeout(() => {
      ele.remove()
      tipCount--
    }, 400)
  }, 3000)
}
