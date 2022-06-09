
(function () {
  Vue.component('vue-item', {
    props: ['jsondata', 'theme'],
    template: '#item-template'
  })

  Vue.component('vue-outer', {
    props: ['jsondata', 'isend', 'path', 'theme'],
    template: '#outer-template'
  })

  Vue.component('vue-expand', {
    props: [],
    template: '#expand-template'
  })

  Vue.component('vue-val', {
    props: ['field', 'val', 'isend', 'path', 'theme'],
    template: '#val-template'
  })

  Vue.use({
    install: function (Vue, options) {

      // 判断数据类型
      Vue.prototype.getTyp = function (val) {
        return toString.call(val).split(']')[0].split(' ')[1]
      }

      // 判断是否是对象或者数组，以对下级进行渲染
      Vue.prototype.isObjectArr = function (val) {
        return ['Object', 'Array'].indexOf(this.getTyp(val)) > -1
      }

      // 折叠
      Vue.prototype.fold = function ($event) {
        var target = Vue.prototype.expandTarget($event)
        target.siblings('svg').show()
        target.hide().parent().siblings('.expand-view').hide()
        target.parent().siblings('.fold-view').show()
      }
      // 展开
      Vue.prototype.expand = function ($event) {
        var target = Vue.prototype.expandTarget($event)
        target.siblings('svg').show()
        target.hide().parent().siblings('.expand-view').show()
        target.parent().siblings('.fold-view').hide()
      }

      //获取展开折叠的target
      Vue.prototype.expandTarget = function ($event) {
        switch($event.target.tagName.toLowerCase()) {
          case 'use':
            return $($event.target).parent()
          case 'label':
            return $($event.target).closest('.fold-view').siblings('.expand-wraper').find('.icon-square-plus').first()
          default:
            return $($event.target)
        }
      }

      // 格式化值
      Vue.prototype.formatVal = function (val) {
        switch(Vue.prototype.getTyp(val)) {
          case 'String':
            return '"' + val + '"'
          case 'Null':
            return 'null'
          default:
            return val
        }
      }

      // 判断值是否是链接
      Vue.prototype.isaLink = function (val) {
        return /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(val)
      }

      // 计算对象的长度
      Vue.prototype.objLength = function (obj) {
        return Object.keys(obj).length
      }

      /**渲染 JSON key:value 项
       * @author TommyLemon
       * @param val
       * @param key
       * @return {boolean}
       */
      Vue.prototype.onRenderJSONItem = function (val, key, _$_this_$_) {
        if (isSingle || key == null) {
          return true
        }
        if (key == '_$_this_$_') {
          // return true
          return false
        }

        try {
          var $this = {}
          var path = ''
          var defaultTable = null
          if (val instanceof Object || val instanceof Array) {
            if (_$_this_$_ != null) {
              $this = JSON.parse(_$_this_$_)
              path = $this.path
              defaultTable = $this.table
            }
          }

          if (val instanceof Array) {
            if (val[0] instanceof Object && (val[0] instanceof Array == false)) { // && JSONObject.isArrayKey(key)) {
              // alert('onRenderJSONItem  key = ' + key + '; val = ' + JSON.stringify(val))

              var arrayIndex = key.lastIndexOf('[]')
              if (arrayIndex < 0) {
                arrayIndex = key.lastIndexOf('ist') - 1
              }
              var ckey = arrayIndex < 0 ? key : key.substring(0, arrayIndex);

              var aliaIndex = ckey.indexOf(':');
              var objName = aliaIndex < 0 ? ckey : ckey.substring(0, aliaIndex);

              var firstIndex = objName.indexOf('-');
              var firstKey = firstIndex < 0 ? objName : objName.substring(0, firstIndex);

              if (firstKey.endsWith('DTO')) {
                firstKey = firstKey.substring(0, firstKey.length - 'DTO'.length)
              }
              if (firstKey.endsWith('Resp')) {
                firstKey = firstKey.substring(0, firstKey.length - 'Resp'.length)
              }
              else if (firstKey.endsWith('Res')) {
                firstKey = firstKey.substring(0, firstKey.length - 'Res'.length)
              }
              else if (firstKey.endsWith('Result')) {
                firstKey = firstKey.substring(0, firstKey.length - 'Result'.length)
              }

              if (firstKey.endsWith('Info')) {
                firstKey = firstKey.substring(0, firstKey.length - 'Info'.length)
              }

              if (StringUtil.isEmpty(firstKey, true) && defaultTable != null) {
                firstKey = defaultTable
              }
              var isTableKey = JSONObject.isTableKey(firstKey)

              for (var i = 0; i < val.length; i++) {
                var cPath = (StringUtil.isEmpty(path, false) ? '' : path + '/') + key;

                if (isTableKey) {
                  // var newVal = JSON.parse(JSON.stringify(val[i]))

                  var newVal = {}
                  for (var k in val[i]) {
                    newVal[k] = val[i][k] //提升性能
                    delete val[i][k]
                  }

                  val[i]._$_this_$_ = JSON.stringify({
                    path: cPath + '/' + i,
                    table: CodeUtil.getTableFromKey(firstKey)
                  })

                  for (var k in newVal) {
                    val[i][k] = newVal[k]
                  }
                }
                else {
                  this.onRenderJSONItem(val[i], '' + i, JSON.stringify({
                    path: cPath + '/' + i,
                    table: CodeUtil.getTableFromKey(firstKey)
                  }));
                }

                // this.$children[i]._$_this_$_ = key
                // alert('this.$children[i]._$_this_$_ = ' + this.$children[i]._$_this_$_)
              }
            }
          }
          else if (val instanceof Object) {
            if (val._$_this_$_ != null) {
              return true
            }

            var aliaIndex = key.indexOf(':');
            var objName = aliaIndex < 0 ? key : key.substring(0, aliaIndex);

            // var newVal = JSON.parse(JSON.stringify(val))

            var newVal = {}
            for (var k in val) {
              newVal[k] = val[k] //提升性能
              delete val[k]
            }

            if (objName == 'data') {
              objName = ''
            }
            else {
              if (objName.endsWith('DTO')) {
                objName = objName.substring(0, objName.length - 'DTO'.length)
              }
              if (objName.endsWith('Resp')) {
                objName = objName.substring(0, objName.length - 'Resp'.length)
              }
              else if (objName.endsWith('Res')) {
                objName = objName.substring(0, objName.length - 'Res'.length)
              }
              else if (objName.endsWith('Result')) {
                objName = objName.substring(0, objName.length - 'Result'.length)
              }

              if (objName.endsWith('Info')) {
                objName = objName.substring(0, objName.length - 'Info'.length)
              }
            }

            if (StringUtil.isEmpty(objName, true) && defaultTable != null) {
              objName = defaultTable
            }

            val._$_this_$_ = JSON.stringify({
              path: (StringUtil.isEmpty(path, false) ? '' : path + '/') + key,
              table: JSONObject.isTableKey(objName) ? CodeUtil.getTableFromKey(objName) : null
            })

            for (var k in newVal) {
              val[k] = newVal[k]
            }

            // val = Object.assign({ _$_this_$_: objName }, val) //解决多显示一个逗号 ,

            // this._$_this_$_ = key  TODO  不影响 JSON 的方式，直接在组件读写属性
            // alert('this._$_this_$_ = ' + this._$_this_$_)
          }


        } catch (e) {
          alert('onRenderJSONItem  try { ... } catch (e) {\n' + e.message)
        }

        return true

      }


      /**显示 Response JSON 的注释
       * @author TommyLemon
       * @param val
       * @param key
       * @param $event
       */
      Vue.prototype.setResponseHint = function (val, key, $event) {
        console.log('setResponseHint')
        this.$refs.responseKey.setAttribute('data-hint', isSingle ? '' : this.getResponseHint(val, key, $event));
      }
      /**获取 Response JSON 的注释
       * 方案一：
       * 拿到父组件的 key，逐层向下传递
       * 问题：拿不到爷爷组件 "Comment[]": [ { "id": 1, "content": "content1" }, { "id": 2 }... ]
       *
       * 方案二：
       * 改写 jsonon 的 refKey 为 key0/key1/.../refKey
       * 问题：遍历，改 key；容易和特殊情况下返回的同样格式的字段冲突
       *
       * 方案三：
       * 改写 jsonon 的结构，val 里加 .path 或 $.path 之类的隐藏字段
       * 问题：遍历，改 key；容易和特殊情况下返回的同样格式的字段冲突
       *
       * @author TommyLemon
       * @param val
       * @param key
       * @param $event
       */
      Vue.prototype.getResponseHint = function (val, key, $event) {
        // alert('setResponseHint  key = ' + key + '; val = ' + JSON.stringify(val))

        var s = ''

        try {

          var path = null
          var table = null
          var column = null
          if (val instanceof Object && (val instanceof Array == false)) {

            var parent = $event.currentTarget.parentElement.parentElement
            var valString = parent.textContent

            // alert('valString = ' + valString)

            var i = valString.indexOf('"_$_this_$_":  "')
            if (i >= 0) {
              valString = valString.substring(i + '"_$_this_$_":  "'.length)
              i = valString.indexOf('}"')
              if (i >= 0) {
                valString = valString.substring(0, i + 1)
                // alert('valString = ' + valString)
                var _$_this_$_ = JSON.parse(valString) || {}
                path = _$_this_$_.path
                table = _$_this_$_.table
              }


              var aliaIndex = key == null ? -1 : key.indexOf(':');
              var objName = aliaIndex < 0 ? key : key.substring(0, aliaIndex);

              if (key == 'data') {
                if (path == 'data') {
                  path = ''
                }
              }
              else if (JSONObject.isTableKey(objName)) {
                table = objName
              }
              else if (JSONObject.isTableKey(table)) {
                column = key
              }

              // alert('path = ' + path + '; table = ' + table + '; column = ' + column)
            }
          }
          else {
            var parent = $event.currentTarget.parentElement.parentElement
            var valString = parent.textContent

            // alert('valString = ' + valString)

            var i = valString.indexOf('"_$_this_$_":  "')
            if (i >= 0) {
              valString = valString.substring(i + '"_$_this_$_":  "'.length)
              i = valString.indexOf('}"')
              if (i >= 0) {
                valString = valString.substring(0, i + 1)
                // alert('valString = ' + valString)
                var _$_this_$_ = JSON.parse(valString) || {}
                path = _$_this_$_.path
                table = _$_this_$_.table
              }
            }

            if (val instanceof Array && JSONObject.isArrayKey(key)) {
              var arrayIndex = key.lastIndexOf('[]')
              if (arrayIndex < 0) {
                arrayIndex = key.lastIndexOf('ist') - 1
              }
              var key2 = key.substring(0, arrayIndex);

              var aliaIndex = key2 == null ? -1 : key2.indexOf(':');
              var objName = aliaIndex < 0 ? key2 : key2.substring(0, aliaIndex);

              var firstIndex = objName == null ? -1 : objName.indexOf('-');
              var firstKey = firstIndex < 0 ? objName : objName.substring(0, firstIndex);

              // alert('key = ' + key + '; firstKey = ' + firstKey + '; firstIndex = ' + firstIndex)
              if (JSONObject.isTableKey(firstKey)) {
                table = firstKey

                var s0 = '';
                if (firstIndex > 0) {
                  objName = objName.substring(firstIndex + 1);
                  firstIndex = objName.indexOf('-');
                  column = firstIndex < 0 ? objName : objName.substring(0, firstIndex)

                  var c = CodeUtil.getCommentFromDoc(docObj == null ? null : docObj['[]'], StringUtil.firstCase(table, true), column, App.getMethod(), App.database, true); // this.getResponseHint({}, table, $event
                  s0 = column + (StringUtil.isEmpty(c, true) ? '' : ': ' + c)
                }

                var c = CodeUtil.getCommentFromDoc(docObj == null ? null : docObj['[]'], StringUtil.firstCase(table, true), null, App.getMethod(), App.database, true);
                s = (StringUtil.isEmpty(path) ? '' : path + '/') + key + ' 中 '
                  + (
                    StringUtil.isEmpty(c, true) ? '' : table + ': '
                      + c + ((StringUtil.isEmpty(s0, true) ? '' : '  -  ' + s0) )
                  );

                return s;
              }
              //导致 key[] 的 hint 显示为  key[]key[]   else {
              //   s = (StringUtil.isEmpty(path) ? '' : path + '/') + key
              // }
            }
            else {
              if (JSONObject.isTableKey(table)) {
                column = key
              }
              // alert('path = ' + path + '; table = ' + table + '; column = ' + column)
            }
          }
          // alert('setResponseHint  table = ' + table + '; column = ' + column)

          var c = CodeUtil.getCommentFromDoc(docObj == null ? null : docObj['[]'], StringUtil.firstCase(table, true), column, App.getMethod(), App.database, true);

          s += (StringUtil.isEmpty(path) ? '' : path + '/') + (StringUtil.isEmpty(column) ? (StringUtil.isEmpty(table) ? key : table) : column) + (StringUtil.isEmpty(c, true) ? '' : ': ' + c)
        }
        catch (e) {
          s += '\n' + e.message
        }

        return s;
      }

    }
  })


  var DEBUG = false

  var initJson = {}

// 主题 [key, String, Number, Boolean, Null, link-link, link-hover]
  var themes = [
    ['#92278f', '#3ab54a', '#25aae2', '#f3934e', '#f34e5c', '#717171'],
    ['rgb(19, 158, 170)', '#cf9f19', '#ec4040', '#7cc500', 'rgb(211, 118, 126)', 'rgb(15, 189, 170)'],
    ['#886', '#25aae2', '#e60fc2', '#f43041', 'rgb(180, 83, 244)', 'rgb(148, 164, 13)'],
    ['rgb(97, 97, 102)', '#cf4c74', '#20a0d5', '#cd1bc4', '#c1b8b9', 'rgb(25, 8, 174)']
  ]




// APIJSON <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  var REQUEST_TYPE_PARAM = 'PARAM'  // GET parameter
  var REQUEST_TYPE_FORM = 'FORM'  // POST x-www-form-urlencoded
  var REQUEST_TYPE_DATA = 'DATA'  // POST form-data
  var REQUEST_TYPE_JSON = 'JSON'  // POST application/json
  var REQUEST_TYPE_GQL = 'GQL'  // POST application/json

  var RANDOM_DB = 'RANDOM_DB'
  var RANDOM_DB_IN = 'RANDOM_DB_IN'
  var RANDOM_INT = 'RANDOM_INT'
  var RANDOM_NUM = 'RANDOM_NUM'
  var RANDOM_STR = 'RANDOM_STR'
  var RANDOM_IN = 'RANDOM_IN'

  var ORDER_DB = 'ORDER_DB'
  var ORDER_INT = 'ORDER_INT'
  var ORDER_IN = 'ORDER_IN'

  var ORDER_MAP = {}

  //TODO 实际请求后填值? 每次请求，还是一次加载一页缓存起来？
  function randomDb(table, key, count) {
    var json = {
      count: count,
      from: table
    }
    json[table] = {
      '@column': key,
      '@order': 'random()'
    }
    return json
  }
  function randomInt(min, max) {
    return randomNum(min, max, 0);
  }
  function randomNum(min, max, precision) {
    // 0 居然也会转成  Number.MIN_SAFE_INTEGER ！！！
    // start = start || Number.MIN_SAFE_INTEGER
    // end = end || Number.MAX_SAFE_INTEGER

    if (min == null) {
      min = Number.MIN_SAFE_INTEGER
    }
    if (max == null) {
      max = Number.MAX_SAFE_INTEGER
    }
    if (precision == null) {
      precision = 2
    }

    return + ((max - min)*Math.random() + min).toFixed(precision);
  }
  function randomStr(minLength, maxLength, availableChars) {
    return 'Ab_Cd' + randomNum();
  }
  function randomIn(...args) {
    return args == null || args.length <= 0 ? null : args[randomInt(0, args.length - 1)];
  }

  //TODO 实际请求后填值? 每次请求，还是一次加载一页缓存起来？
  function orderDb(index, table, key, order) {
    var json = {
      count: 1,
      page: index,
      from: table
    }
    json[table] = {
      '@column': key,
      '@order': order || (key + '+')
    }
    return json
  }
  function orderInt(index, min, max) {
    if (min == null) {
      min = Number.MIN_SAFE_INTEGER
    }
    if (max == null) {
      max = Number.MAX_SAFE_INTEGER
    }
    return min + index%(max - min + 1)
  }
  function orderIn(index, ...args) {
    // alert('orderIn  index = ' + index + '; args = ' + JSON.stringify(args));
    index = index || 0;
    return args == null || args.length <= index ? null : args[index];
  }

  function getOrderIndex(randomId, lineKey, argCount) {
    // alert('randomId = ' + randomId + '; lineKey = ' + lineKey + '; argCount = ' + argCount);
    // alert('ORDER_MAP = ' + JSON.stringify(ORDER_MAP, null, '  '));

    if (randomId == null) {
      randomId = 0;
    }
    if (ORDER_MAP == null) {
      ORDER_MAP = {};
    }
    if (ORDER_MAP[randomId] == null) {
      ORDER_MAP[randomId] = {};
    }

    var orderIndex = ORDER_MAP[randomId][lineKey];
    // alert('orderIndex = ' + orderIndex)

    if (orderIndex == null || orderIndex < -1) {
      orderIndex = -1;
    }

    orderIndex ++
    orderIndex = argCount == null || argCount <= 0 ? orderIndex : orderIndex%argCount;
    ORDER_MAP[randomId][lineKey] = orderIndex;

    // alert('orderIndex = ' + orderIndex)
    // alert('ORDER_MAP = ' + JSON.stringify(ORDER_MAP, null, '  '));
    return orderIndex;
  }
  //这些全局变量不能放在data中，否则会报undefined错误

  var DEBUG = true

  var baseUrl
  var inputted
  var handler
  var docObj
  var doc
  var output

  var isSingle = true

  var doneCount

// APIJSON >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  var App = new Vue({
    el: '#app',
    data: {
      baseview: 'formater',
      view: 'output',
      jsoncon: JSON.stringify(initJson),
      jsonhtml: initJson,
      compressStr: '',
      error: {},
      requestVersion: 3,
      requestCount: 1,
      urlComment: 'One to many: Comment.userId = User.id',
      historys: [],
      history: {name: 'Req 0'},
      remotes: [],
      locals: [],
      testCases: [],
      randoms: [],
      accounts: [
        {
          'isLoggedIn': false,
          'name': 'Account 1',
          'phone': '13000082001',
          'password': '123456'
        },
        {
          'isLoggedIn': false,
          'name': 'Account 2',
          'phone': '13000082002',
          'password': '123456'
        },
        {
          'isLoggedIn': false,
          'name': 'Account 3',
          'phone': '13000082003',
          'password': '123456'
        }
      ],
      currentAccountIndex: 0,
      tests: { '-1':{}, '0':{}, '1':{}, '2': {} },
      crossProcess: 'Cross: Off',
      testProcess: 'ML: Off',
      randomTestTitle: null,
      testRandomProcess: '',
      compareColor: '#0000',
      isDelayShow: false,
      isSaveShow: false,
      isExportShow: false,
      isExportRandom: false,
      isTestCaseShow: false,
      isHeaderShow: false,
      isRandomShow: true,  //默认展示
      isRandomListShow: false,
      isLoginShow: false,
      isConfigShow: false,
      isDeleteShow: false,
      currentDocItem: {},
      currentRemoteItem: {},
      currentRandomItem: {},
      isAdminOperation: false,
      loginType: 'login',
      isExportRemote: false,
      isRegister: false,
      isCrossEnabled: false,
      isMLEnabled: false,
      isDelegateEnabled: false,
      isLocalShow: false,
      uploadTotal: 0,
      uploadDoneCount: 0,
      uploadFailCount: 0,
      exTxt: {
        name: 'Test',
        button: 'Save',
        index: 0
      },
      themes: themes,
      checkedTheme: 0,
      isExpand: true,
      User: {
        id: 0,
        name: '',
        head: ''
      },
      Privacy: {
        id: 0,
        balance: null //点击更新提示需要判空 0.00
      },
      type: REQUEST_TYPE_GQL,
      types: [ REQUEST_TYPE_GQL, REQUEST_TYPE_JSON ],  //默认展示
      host: '',
      database: 'MYSQL',// 'POSTGRESQL',
      schema: 'sys',
      server: 'http://apijson.org:9090',  //apijson.org:8000
      // server: 'http://47.74.39.68:9090',  // apijson.org
      swagger: 'http://apijson.cn:8080/v2/api-docs',  //apijson.org:8000
      language: 'Java',
      header: {},
      page: 0,
      count: 100,
      search: '',
      testCasePage: 0,
      testCaseCount: 50,
      testCaseSearch: '',
      indent: '  '
    },
    methods: {

      // 全部展开
      expandAll: function () {
        if (App.view != 'code') {
          alert('Get JSON Response first!')
          return
        }

        $('.icon-square-min').show()
        $('.icon-square-plus').hide()
        $('.expand-view').show()
        $('.fold-view').hide()

        App.isExpand = true;
      },

      // 全部折叠
      collapseAll: function () {
        if (App.view != 'code') {
          alert('Get JSON Response first!')
          return
        }

        $('.icon-square-min').hide()
        $('.icon-square-plus').show()
        $('.expand-view').hide()
        $('.fold-view').show()

        App.isExpand = false;
      },

      // diff
      diffTwo: function () {
        var oldJSON = {}
        var newJSON = {}
        App.view = 'code'
        try {
          oldJSON = jsonlint.parse(App.jsoncon)
        } catch (ex) {
          App.view = 'error'
          App.error = {
            msg: 'Old JSON parse error\r\n' + ex.message
          }
          return
        }

        try {
          newJSON = jsonlint.parse(App.jsoncon)
        } catch (ex) {
          App.view = 'error'
          App.error = {
            msg: 'New JSON parse error\r\n' + ex.message
          }
          return
        }

        var base = difflib.stringAsLines(JSON.stringify(oldJSON, '', 4))
        var newtxt = difflib.stringAsLines(JSON.stringify(newJSON, '', 4))
        //无效，HTML 还是 4 个空格，而且可能导致错误
        // var indent = this.indent || '    '
        // var base = difflib.stringAsLines(JSON.stringify(oldJSON, null, indent))
        // var newtxt = difflib.stringAsLines(JSON.stringify(newJSON, null, indent))

        var sm = new difflib.SequenceMatcher(base, newtxt)
        var opcodes = sm.get_opcodes()
        $('#diffoutput').empty().append(diffview.buildView({
          baseTextLines: base,
          newTextLines: newtxt,
          opcodes: opcodes,
          baseTextName: 'Old JSON',
          newTextName: 'New JSON',
          contextSize: 2,
          viewType: 0
        }))
      },

      baseViewToDiff: function () {
        this.baseview = 'diff'
        this.diffTwo()
      },

      // 回到格式化视图
      baseViewToFormater: function () {
        this.baseview = 'formater'
        this.view = 'code'
        this.showJsonView(jsonlint.parse(this.jsoncon))
      },

      // 根据json内容变化格式化视图
      showJsonView: function (json, table) {
        this.jsoncon = json == null ? '' : JSON.stringify(json, null, '    ')

        if (this.baseview === 'diff') {
          return
        }
        try {
          if (this.jsoncon.trim() === '') {
            this.view = 'empty'
          } else {
            this.view = 'code'

            json = jsonlint.parse(this.jsoncon)  //避免改变原来的值

            if (isSingle != true && json instanceof Array == false && json instanceof Object) {

              if (json.data instanceof Object && StringUtil.isEmpty(table) != true) {
                if (json.data instanceof Array) {
                  var arr = json.data
                  for (var i in arr) {
                    if (arr[i] instanceof Array == false && arr[i] instanceof Object) {
                      //把 data 及 data/list 转为对应的表
                      arr[i] = Object.assign({
                        _$_this_$_: JSON.stringify({
                          path: 'data/' + i,
                          table: table
                        })
                      }, arr[i])
                    }
                  }
                }
                else {
                  //把 data 及 data/list 转为对应的表
                  json.data = Object.assign({
                    _$_this_$_: JSON.stringify({
                      path: 'data',
                      table: table
                    })
                  }, json.data)
                }
              }

              //解决最外层多了路径 'data/msg'
              json = Object.assign({
                _$_this_$_: JSON.stringify({
                  path: '',
                  table: table
                })
              }, json)

            }

            this.jsonhtml = json
          }
        }
        catch (ex) {
          this.view = 'error'
          this.error = {
            msg: ex.message
          }
        }
      },

      isAPIJSON: function(url) {
        return ! this.isGraphQL(url)
      },
      isGraphQL: function(url) {
        var baseUrl = url || this.getBaseUrl()
        return baseUrl.indexOf('graphql') >= 0 || App.schema == 'graphql'

      },

      showUrl: function (isAdminOperation, branchUrl) {
        if (StringUtil.isEmpty(this.host, true)) {  //显示(可编辑)URL Host
          if (isAdminOperation != true) {
            baseUrl = this.getBaseUrl()
          }
          vUrl.value = (isAdminOperation ? App.server : baseUrl) + branchUrl
        }
        else {  //隐藏(固定)URL Host
          if (isAdminOperation) {
            this.host = App.server
          }
          vUrl.value = branchUrl
        }

        vUrlComment.value = isSingle || StringUtil.isEmpty(App.urlComment, true)
          ? '' : vUrl.value + CodeUtil.getComment(App.urlComment, false, '  ')
          + ' - ' + (App.requestVersion > 0 ? 'V' + App.requestVersion : 'V*');
      },

      //设置基地址
      setBaseUrl: function () {
        if (StringUtil.isEmpty(this.host, true) != true) {
          return
        }
        // 重新拉取文档
        var bu = this.getBaseUrl()
        if (baseUrl != bu) {
          baseUrl = bu;
          doc = null //这个是本地的数据库字典及非开放请求文档
          this.saveCache('', 'URL_BASE', baseUrl)

          //已换成固定的管理系统URL

          // this.remotes = []

          // var index = baseUrl.indexOf(':') //http://localhost:8080
          // App.server = (index < 0 ? baseUrl : baseUrl.substring(0, baseUrl)) + ':9090'

        }
      },
      getUrl: function () {
        var url = StringUtil.get(this.host) + new String(vUrl.value)
        return url.replace(/ /g, '')
      },
      //获取基地址
      getBaseUrl: function () {
        var url = new String(vUrl.value).trim()
        var length = this.getBaseUrlLength(url)
        url = length <= 0 ? '' : url.substring(0, length)
        return url == '' ? URL_BASE : url
      },
      //获取基地址长度，以://后的第一个/分割baseUrl和method
      getBaseUrlLength: function (url_) {
        var url = StringUtil.trim(url_)
        var index = url.indexOf(' ')
        if (index >= 0) {
          return index + 1
        }

        index = url.indexOf('://')
        return index < 0 ? 0 : index + 3 + url.substring(index + 3).indexOf('/')
      },
      //获取操作方法
      getMethod: function () {
        var url = new String(vUrl.value).trim()
        var index = this.getBaseUrlLength(url)
        url = index <= 0 ? url : url.substring(index)
        return url.startsWith('/') ? url.substring(1) : url
      },
      //获取请求的tag
      getTag: function () {
        var req = null;
        try {
          req = this.getRequest(vInput.value);
        } catch (e) {
          log('main.getTag', 'try { req = this.getRequest(vInput.value); \n } catch (e) {\n' + e.message)
        }
        return req == null ? null : req.tag
      },

      getRequest: function (json, defaultValue, graphqlQuery) {
        var req
        if (json != null && json instanceof Object) {
          req = json
        }
        else {
          var s = App.toDoubleJSON(json, defaultValue)

          if (StringUtil.isEmpty(s, true)) {
            req = defaultValue
          }
          else {
            try {
              req = jsonlint.parse(s);
            }
            catch (e) {
              log('main.getRequest', 'try { return jsonlint.parse(s); \n } catch (e) {\n' + e.message)
              log('main.getRequest', 'req = jsonlint.parse(App.removeComment(s));')
              req = jsonlint.parse(App.removeComment(s));
            }
          }
        }

        if (graphqlQuery != null) {
          req = {
            //FIXME 是否必要？
            // "operationName": "loginByPassword",
            "variables": req,
            "query": App.getGraphQLQuery(graphqlQuery)
          }
        }

        return req;
      },
      getGraphQLQuery: function (query, defaultValue) {
        if (StringUtil.isEmpty(query, true)) {
          return defaultValue
        }
        //TODO 校验 GraphQL Query/Mutation
        return query
      },

      getHeader: function (text) {
        var header = {}
        var hs = StringUtil.isEmpty(text, true) ? null : StringUtil.split(text, '\n')

        if (hs != null && hs.length > 0) {
          var item
          for (var i = 0; i < hs.length; i++) {
            item = hs[i]
            var index = item.indexOf('//') //这里只支持单行注释，不用 removeComment 那种带多行的去注释方式
            var item2 = index < 0 ? item : item.substring(0, index)
            item2 = item2.trim()
            if (item2.length <= 0) {
              continue;
            }

            index = item2.indexOf(':')
            if (index <= 0) {
              throw new Error('请求头 Request Header 输入错误！请按照每行 key:value 的格式输入，不要有多余的换行或空格！'
                + '\n错误位置: 第 ' + (i + 1) + ' 行'
                + '\n错误文本: ' + item)
            }
            header[StringUtil.trim(item2.substring(0, index))] = item2.substring(index + 1, item2.length)
          }
        }

        return header
      },

      // 显示保存弹窗
      showSave: function (show) {
        if (show) {
          if (App.isTestCaseShow) {
            alert('Input request JSON first!')
            return
          }

          var tag = App.getTag()
          App.history.name = App.getMethod() + (StringUtil.isEmpty(tag, true) ? '' : ' ' + tag) + ' ' + App.formatTime() //不自定义名称的都是临时的，不需要时间太详细
        }
        App.isSaveShow = show
      },

      // 显示导出弹窗
      showExport: function (show, isRemote, isRandom) {
        if (show) {
          if (isRemote) { //共享测试用例
            App.isExportRandom = isRandom
            if (App.isTestCaseShow) {
              alert('Input request JSON first!')
              return
            }
//            if (App.view != 'code') {
//              alert('请先测试请求，确保是正确可用的！')
//              return
//            }
            if (isRandom) {
              App.exTxt.name = 'Argument config ' + App.formatDateTime()
            }
            else {
              var tag = App.getTag()
              App.exTxt.name = App.getMethod() + (StringUtil.isEmpty(tag, true) ? '' : ' ' + tag)
            }
          }
          else { //下载到本地
            if (App.isTestCaseShow) { //文档
              App.exTxt.name = 'APIJSON自动化文档 ' + App.formatDateTime()
            }
            else if (App.view == 'markdown' || App.view == 'output') {
              var suffix
              switch (App.language) {
                case 'Java':
                  suffix = '.java';
                  break;
                case 'Swift':
                  suffix = '.swift';
                  break;
                case 'Kotlin':
                  suffix = '.kt';
                  break;
                case 'Objective-C':
                  suffix = '.h';
                  break;
                case 'C#':
                  suffix = '.cs';
                  break;
                case 'PHP':
                  suffix = '.php';
                  break;
                case 'Go':
                  suffix = '.go';
                  break;
                //以下都不需要解析，直接用左侧的 JSON
                case 'JavaScript':
                  suffix = '.js';
                  break;
                case 'TypeScript':
                  suffix = '.ts';
                  break;
                case 'Python':
                  suffix = '.py';
                  break;
                default:
                  suffix = '.java';
                  break;
              }

              App.exTxt.name = 'User' + suffix
              alert('自动生成模型代码，可填类名后缀:\n'
                + 'Java.java, Kotlin.kt, Swift.swift, Objective-C.h, Objective-C.m,'
                + '\nTypeScript.ts, JavaScript.js, C#.cs, PHP.php, Python.py, Go.go');
            }
            else {
              App.exTxt.name = 'APIJSON测试 ' + App.getMethod() + ' ' + App.formatDateTime()
            }
          }
        }
        App.isExportShow = show
        App.isExportRemote = isRemote
      },

      // 显示配置弹窗
      showConfig: function (show, index) {
        App.isConfigShow = false
        if (App.isTestCaseShow) {
          if (index == 3 || index == 4 || index == 5 || index == 10) {
            App.showTestCase(false, false)
          }
        }

        if (show) {
          App.exTxt.button = index == 8 ? 'Upload' : 'Change'
          App.exTxt.index = index
          switch (index) {
            case 0:
            case 1:
            case 2:
            case 6:
            case 7:
            case 8:
              App.exTxt.name = index == 0 ? App.database : (index == 1 ? App.schema : (index == 2
                ? App.language : (index == 6 ? App.server : (index == 8 ? App.swagger : (App.types || []).join()))))
              App.isConfigShow = true

              if (index == 0) {
                alert('Database options:\nMYSQL,POSTGRESQL,SQLSERVER,ORACLE')
              }
              else if (index == 2) {
                alert('Language options:\nJava,Kotlin,Swift,Objective-C,\nTypeScript,JavaScript,C#,PHP,Python,Go')
              }
              else if (index == 7) {
                alert('Use , to divide types. Type options:\nPARAM(GET ?key0=value0&key1=value1),\nJSON(POST application/json),\nFORM(POST x-www-form-urlencoded),\nDATA(POST form-data)\nGQL(POST JSON to GraphQL API)')
              }
              break
            case 3:
              App.host = App.getBaseUrl()
              App.showUrl(false, new String(vUrl.value).substring(App.host.length)) //没必要导致必须重新获取 Response，App.onChange(false)
              break
            case 4:
              App.isHeaderShow = show
              App.saveCache('', 'isHeaderShow', show)
              break
            case 5:
              App.isRandomShow = show
              App.saveCache('', 'isRandomShow', show)
              break
            case 9:
              App.isDelegateEnabled = show
              App.saveCache('', 'isDelegateEnabled', show)
              break
          }
        }
        else if (index == 3) {
          var host = StringUtil.get(App.host)
          var branch = new String(vUrl.value)
          App.host = ''
          vUrl.value = host + branch //保证 showUrl 里拿到的 baseUrl = App.host (http://apijson.cn:8080/put /balance)
          App.setBaseUrl() //保证自动化测试等拿到的 baseUrl 是最新的
          App.showUrl(false, branch) //没必要导致必须重新获取 Response，App.onChange(false)
        }
        else if (index == 4) {
          App.isHeaderShow = show
          App.saveCache('', 'isHeaderShow', show)
        }
        else if (index == 5) {
          App.isRandomShow = show
          App.saveCache('', 'isRandomShow', show)
        }
        else if (index == 9) {
          App.isDelegateEnabled = show
          App.saveCache('', 'isDelegateEnabled', show)
        }
      },

      // 显示删除弹窗
      showDelete: function (show, item, index, isRandom) {
        this.isDeleteShow = show
        this.isDeleteRandom = isRandom
        this.exTxt.name = 'Input' + (isRandom ? 'Order & Random config' : 'API') + ' name to confirm'
        if (isRandom) {
          this.currentRandomItem = Object.assign(item, {
            index: index
          })
        }
        else {
          this.currentDocItem = Object.assign(item, {
            index: index
          })
        }
      },

      // 删除接口文档
      deleteDoc: function () {
        var isDeleteRandom = this.isDeleteRandom
        var item = (isDeleteRandom ? this.currentRandomItem : this.currentDocItem) || {}
        var doc = (isDeleteRandom ? item.Random : item.Document) || {}

        var type = isDeleteRandom ? 'Order & Random config' : 'API'
        if (doc.id == null) {
          alert("Haven't selected " + type + ' or ' + type + " doesn't exit！ ")
          return
        }
        if (doc.name != this.exTxt.name) {
          alert('Mismatch for inputted ' + type + ' and ' + type + ' to delete!')
          return
        }

        this.showDelete(false, {})

        this.isTestCaseShow = false
        this.isRandomListShow = false

        var url = this.server + '/delete'
        var req = isDeleteRandom ? {
          format: false,
          'Random': {
            'id': doc.id
          },
          'tag': 'Random'
        } : {
          format: false,
          'Document': {
            'id': doc.id
          },
          'tag': 'Document'
        }
        this.request(true, REQUEST_TYPE_JSON, url, req, {}, function (url, res, err) {
          App.onResponse(url, res, err)

          var rpObj = res.data || {}

          if (isDeleteRandom) {
            if (rpObj.Random != null && rpObj.Random.code == 200) {
              App.randoms.splice(item.index, 1)
              App.showRandomList(true, App.currentRemoteItem)
            }
          } else {
            if (rpObj.Document != null && rpObj.Document.code == 200) {
              App.remotes.splice(item.index, 1)
              App.showTestCase(true, App.isLocalShow)
            }
          }
        })
      },

      // 保存当前的JSON
      save: function () {
        if (App.history.name.trim() === '') {
          Helper.alert('名称不能为空！', 'danger')
          return
        }
        var val = {
          name: App.history.name,
          type: App.type,
          url: '/' + this.getMethod(),
          request: inputted,
          header: vHeader.value,
          random: vRandom.value
        }
        var key = String(Date.now())
        localforage.setItem(key, val, function (err, value) {
          Helper.alert('保存成功！', 'success')
          App.showSave(false)
          val.key = key
          App.historys.push(val)
        })
      },

      // 清空本地历史
      clearLocal: function () {
        this.locals.splice(0, this.locals.length) //UI无反应 this.locals = []
        this.saveCache('', 'locals', [])
      },

      // 删除已保存的
      remove: function (item, index, isRemote, isRandom) {
        if (isRemote == null || isRemote == false) { //null != false
          localforage.removeItem(item.key, function () {
            App.historys.splice(index, 1)
          })
        } else {
          if (App.isLocalShow) {
            App.locals.splice(index, 1)
            return
          }

          this.showDelete(true, item, index, isRandom)
        }
      },

      // 根据随机测试用例恢复数据
      restoreRandom: function (item) {
        this.currentRandomItem = item
        this.isRandomListShow = false

        var random = (item || {}).Random || {}
        this.randomTestTitle = random.name
        vRandom.value = StringUtil.get(random.config)
      },
      // 根据测试用例/历史记录恢复数据
      restoreRemoteAndTest: function (item) {
        this.restoreRemote(item, true)
      },
      // 根据测试用例/历史记录恢复数据
      restoreRemote: function (item, test) {
        this.currentRemoteItem = item
        this.restore((item || {}).Document, true, test)
      },
      // 根据历史恢复数据
      restore: function (item, isRemote, test) {
        item = item || {}
        localforage.getItem(item.key || '', function (err, value) {
          var branch = new String(item.url || '/get')
          if (branch.startsWith('/') == false) {
            branch = '/' + branch
          }

          App.type = item.type;
          App.urlComment = item.name;
          App.requestVersion = item.version;
          App.showUrl(false, branch)

          App.showTestCase(false, App.isLocalShow)

          if (App.type == REQUEST_TYPE_GQL) {
            var req = item.request == null ? null : JSON.parse(item.request)
            vInput.value = req == null || req.variables == null
              ? ""
              : (typeof req.variables != 'string' // req.variables instanceof Object
                ? JSON.stringify(req.variables, null, App.indent)
                : req.variables
              )
            vGraphQLInput.value = StringUtil.get(req == null ? null : req.query)
          }
          else {
            vInput.value = StringUtil.get(item.request)
          }

          vHeader.value = StringUtil.get(item.header)
          vRandom.value = StringUtil.get(item.random)
          App.onChange(false)

          if (isRemote) {
            App.randoms = []
            App.showRandomList(App.isRandomListShow, item)
          }
          if (test) {
            App.send(false)
          }
        })
      },

      // 获取所有保存的json
      listHistory: function () {
        localforage.iterate(function (value, key, iterationNumber) {
          if (key[0] !== '#') {
            value.key = key
            App.historys.push(value)
          }
          if (key === '#theme') {
            // 设置默认主题
            App.checkedTheme = value
          }
        })
      },

      // 导出文本
      exportTxt: function () {
        App.isExportShow = false

        if (App.isExportRemote == false) { //下载到本地

          if (App.isTestCaseShow) { //文档
            saveTextAs('# ' + App.exTxt.name + '\n主页: https://github.com/APIJSON/APIJSON'
              + '\n\nBASE_URL: ' + this.getBaseUrl()
              + '\n\n\n## 测试用例(Markdown格式，可用工具预览) \n\n' + App.getDoc4TestCase()
              + '\n\n\n\n\n\n\n\n## 文档(Markdown格式，可用工具预览) \n\n' + doc
              , App.exTxt.name + '.txt')
          }
          else if (App.view == 'markdown' || App.view == 'output') { //model
            var clazz = StringUtil.trim(App.exTxt.name)

            var txt = '' //配合下面 +=，实现注释判断，一次全生成，方便测试
            if (clazz.endsWith('.java')) {
              txt += CodeUtil.parseJavaBean(docObj, clazz.substring(0, clazz.length - 5), App.database)
            }
            else if (clazz.endsWith('.swift')) {
              txt += CodeUtil.parseSwiftStruct(docObj, clazz.substring(0, clazz.length - 6), App.database)
            }
            else if (clazz.endsWith('.kt')) {
              txt += CodeUtil.parseKotlinDataClass(docObj, clazz.substring(0, clazz.length - 3), App.database)
            }
            else if  (clazz.endsWith('.h')) {
              txt += CodeUtil.parseObjectiveCEntityH(docObj, clazz.substring(0, clazz.length - 2), App.database)
            }
            else if  (clazz.endsWith('.m')) {
              txt += CodeUtil.parseObjectiveCEntityM(docObj, clazz.substring(0, clazz.length - 2), App.database)
            }
            else if  (clazz.endsWith('.cs')) {
              txt += CodeUtil.parseCSharpEntity(docObj, clazz.substring(0, clazz.length - 3), App.database)
            }
            else if  (clazz.endsWith('.php')) {
              txt += CodeUtil.parsePHPEntity(docObj, clazz.substring(0, clazz.length - 4), App.database)
            }
            else if  (clazz.endsWith('.go')) {
              txt += CodeUtil.parseGoEntity(docObj, clazz.substring(0, clazz.length - 3), App.database)
            }
            else if  (clazz.endsWith('.js')) {
              txt += CodeUtil.parseJavaScriptEntity(docObj, clazz.substring(0, clazz.length - 3), App.database)
            }
            else if  (clazz.endsWith('.ts')) {
              txt += CodeUtil.parseTypeScriptEntity(docObj, clazz.substring(0, clazz.length - 3), App.database)
            }
            else if (clazz.endsWith('.py')) {
              txt += CodeUtil.parsePythonEntity(docObj, clazz.substring(0, clazz.length - 3), App.database)
            }
            else {
              alert('请正确输入对应语言的类名后缀！')
            }

            if (StringUtil.isEmpty(txt, true)) {
              alert('找不到 ' + clazz + ' 对应的表！请检查数据库中是否存在！\n如果不存在，请重新输入存在的表；\n如果存在，请刷新网页后重试。')
              return
            }
            saveTextAs(txt, clazz)
          }
          else {
            var res = JSON.parse(App.jsoncon)
            res = this.removeDebugInfo(res)

            var s = ''
            switch (App.language) {
              case 'Java':
                s += '(Java):\n\n' + CodeUtil.parseJavaResponse('', res, 0, false, ! isSingle)
                break;
              case 'Swift':
                s += '(Swift):\n\n' + CodeUtil.parseSwiftResponse('', res, 0, isSingle)
                break;
              case 'Kotlin':
                s += '(Kotlin):\n\n' + CodeUtil.parseKotlinResponse('', res, 0, false, ! isSingle)
                break;
              case 'Objective-C':
                s += '(Objective-C):\n\n' + CodeUtil.parseObjectiveCResponse('', res, 0)
                break;
              case 'C#':
                s += '(C#):\n\n' + CodeUtil.parseCSharpResponse('', res, 0)
                break;
              case 'PHP':
                s += '(PHP):\n\n' + CodeUtil.parsePHPResponse('', res, 0, isSingle)
                break;
              case 'Go':
                s += '(Go):\n\n' + CodeUtil.parseGoResponse('', res, 0)
                break;
              case 'JavaScript':
                s += '(JavaScript):\n\n' + CodeUtil.parseJavaScriptResponse('', res, 0, isSingle)
                break;
              case 'TypeScript':
                s += '(TypeScript):\n\n' + CodeUtil.parseTypeScriptResponse('', res, 0, isSingle)
                break;
              case 'Python':
                s += '(Python):\n\n' + CodeUtil.parsePythonResponse('', res, 0, isSingle)
                break;
              default:
                s += ':\n没有生成代码，可能生成代码(封装,解析)的语言配置错误。 \n';
                break;
            }

            saveTextAs('# ' + App.exTxt.name + '\n主页: https://github.com/APIJSON/APIJSON'
              + '\n\n\nURL: ' + StringUtil.get(vUrl.value)
              + '\n\n\nHeader:\n' + StringUtil.get(vHeader.value)
              + '\n\n\nRequest:\n' + StringUtil.get(vInput.value)
              + '\n\n\nResponse:\n' + StringUtil.get(App.jsoncon)
              + '\n\n\n## 解析 Response 的代码' + s
              , App.exTxt.name + '.txt')
          }
        }
        else { //上传到远程服务器
          var id = App.User == null ? null : App.User.id
          if (id == null || id <= 0) {
            alert('请先登录！')
            return
          }
          var isExportRandom = App.isExportRandom
          var did = ((App.currentRemoteItem || {}).Document || {}).id
          if (isExportRandom && did == null) {
            alert('请先共享测试用例！')
            return
          }

          App.isTestCaseShow = false

          var currentAccountId = App.getCurrentAccountId()

          var url = App.server + '/post'
          var currentResponse = StringUtil.isEmpty(App.jsoncon, true) ? {} : App.removeDebugInfo(JSON.parse(App.jsoncon))
          var reqStr = App.toDoubleJSON(inputted)
          if (App.type == REQUEST_TYPE_GQL) {
            reqStr = JSON.stringify({
              "variables": reqStr,
              "query": App.getGraphQLQuery(vGraphQLInput.value)
            }, null, App.indent)
          }

          var req = isExportRandom ? {
            format: false,
            'Random': {
              documentId: did,
              count: App.requestCount,
              name: App.exTxt.name,
              config: vRandom.value
            },
            'tag': 'Random'
          } : {
            format: false,
            'Document': {
              'userId': App.User.id,
              'testAccountId': currentAccountId,
              'name': App.exTxt.name,
              'type': App.type,
              'url': '/' + App.getMethod(),
              'request': reqStr,
              'header': vHeader.value
            },
            'TestRecord': {
              'documentId@': '/Document/id',
              'randomId': 0,
              'userId': App.User.id,
              'host': App.getBaseUrl(),
              'testAccountId': currentAccountId,
              'response': JSON.stringify(currentResponse),
              'standard': App.isMLEnabled ? JSON.stringify(JSONResponse.updateStandard({}, currentResponse)) : null
            },
            'tag': 'Document'
          }

          App.request(true, REQUEST_TYPE_JSON, url, req, {}, function (url, res, err) {
            App.onResponse(url, res, err)

            var rpObj = res.data || {}

            if (isExportRandom) {
              if (rpObj.Random != null && rpObj.Random.code == 200) {
                App.randoms = []
                App.showRandomList(true, (App.currentRemoteItem || {}).Document)
              }
            }
            else {
              if (rpObj.Document != null && rpObj.Document.code == 200) {
                App.remotes = []
                App.showTestCase(true, false)


                //自动生成随机配置（遍历 JSON，对所有可变值生成配置，排除 @key, key@, key() 等固定值）
                var req = App.getRequest(vInput.value, {})
                var config = StringUtil.trim(App.newRandomConfig(null, '', req))
                if (config == '') {
                  return;
                }

                App.request(true, REQUEST_TYPE_JSON, App.server + '/post', {
                  format: false,
                  'Random': {
                    documentId: rpObj.Document.id,
                    count: App.requestCount,
                    name: '默认配置(上传测试用例时自动生成)',
                    config: config
                  },
                  'tag': 'Random'
                }, {}, function (url, res, err) {
                  if (res.data != null && res.data.Random != null && res.data.Random.code == CODE_SUCCESS) {
                    alert('已自动生成并上传随机配置:\n' + config)
                    App.isRandomListShow = true
                  }
                  else {
                    alert('已自动生成，但上传以下随机配置失败:\n' + config)
                    vRandom.value = config
                  }
                  App.onResponse(url, res, err)
                })
              }
            }
          })
        }
      },

      newRandomConfig: function (path, key, value, isAPIJSON, isGraphQL) {
        if (key == null) {
          return ''
        }
        if (isGraphQL) {
          if (path == '' && key != 'variables') {
            return ''
          }
        }

        if (isAPIJSON) {
          if (path == '' && (key == 'tag' || key == 'version' || key == 'format')) {
            return ''
          }
        }

        var childPath = path == null || path == '' ? key : path + '/' + key
        var prefix = '\n' + childPath + ' : '

        if (isAPIJSON != true && key =='page') {
          return prefix + 'ORDER_INT(1, 10)'
        }
        if (isAPIJSON != true && key =='pageSize') {
          return prefix + 'ORDER_IN(undefined, null, 5, 10, 15, 20'
            + ([5, 10, 15, 20].indexOf(value) >= 0 ? ')' : ', ' + value + ')')
        }

        var config = ''

        if (value instanceof Array) {
          var val
          if (value.length <= 0) {
            val = ''
          }
          else {
            if (value.length <= 1) {
              val = ', ' + JSON.stringify(value)
            }
            else if (value.length <= 2) {
              val = ', ' + JSON.stringify([value[0]]) + ', ' + JSON.stringify([value[1]]) + ', ' + JSON.stringify(value)
            }
            else {
              val = ', ' + JSON.stringify([value[0]]) + ', ' + JSON.stringify([value[value.length - 1]]) + ', ' + JSON.stringify([value[Math.floor(value.length / 2)]]) + ', ' + JSON.stringify(value)
            }
          }
          config += prefix + 'ORDER_IN(undefined, null, []' + val + ')'
        }
        else if (value instanceof Object) {
          for(var k in value) {
            var v = value[k]

            if (isAPIJSON) {
              var isAPIJSONArray = v instanceof Object && v instanceof Array == false
                && k.startsWith('@') == false && (k.endsWith('[]') || k.endsWith('@'))
              if (isAPIJSONArray) {
                if (k.endsWith('@')) {
                  delete v.from
                  delete v.range
                }

                prefix = '\n' + (childPath == null || childPath == '' ? '' : childPath + '/') + k + '/'
                if (v.hasOwnProperty('page')) {
                  config += prefix + 'page : ' + 'ORDER_INT(0, 10)'
                  delete v.page
                }
                if (v.hasOwnProperty('count')) {
                  config += prefix + 'count : ' + 'ORDER_IN(undefined, null, 0, 1, 5, 10, 20'
                    + ([0, 1, 5, 10, 20].indexOf(v.count) >= 0 ? ')' : ', ' + v.count + ')')
                  delete v.count
                }
                if (v.hasOwnProperty('query')) {
                  config += prefix + 'query : ' + 'ORDER_IN(undefined, null, 0, 1, 2)'
                  delete v.query
                }
              }
            }

            config += App.newRandomConfig(childPath, k, v, isAPIJSON, isGraphQL)
          }
        }
        else {
          //自定义关键词
          if (isAPIJSON && key.startsWith('@')) {
            return config
          }

          if (typeof value == 'boolean') {
            config += prefix + 'ORDER_IN(undefined, null, false, true)'
          }
          else if (typeof value == 'number') {
            var isId = key == 'id' || key.endsWith('Id') || key.endsWith('_id') || key.endsWith('_ID')
            if (isId) {
              config += prefix + 'ORDER_IN(undefined, null, ' + value + ')'
              if (value >= 1000000000) { //PHP 等语言默认精确到秒 1000000000000) {
                config += '\n//可替代上面的 ' + prefix.substring(1) + 'RANDOM_INT(' + Math.round(0.9*value) + ', ' + Math.round(1.1*value) + ')'
              }
              else {
                config += '\n//可替代上面的 ' + prefix.substring(1) + 'RANDOM_INT(1, ' + (10*value) + ')'
              }
            }
            else {
              var valStr = String(value)
              var dotIndex = valStr.indexOf('.')
              var hasDot = dotIndex >= 0
              var keep = dotIndex < 0 ? 2 : valStr.length - dotIndex - 1

              if (value < 0) {
                config += prefix + (hasDot ? 'RANDOM_NUM' : 'RANDOM_INT') + '(' + (100*value) + (hasDot ? ', 0, ' + keep + ')' : ', 0)')
              }
              else if (value > 0 && value < 1) {  // 0-1 比例
                config += prefix + 'RANDOM_NUM(0, 1, ' + keep + ')'
              }
              else if ((hasDot && value > 0 && value <= 100) || (hasDot != true && value > 5 && value <= 100)) {  // 10% 百分比
                config += prefix + (hasDot ? 'RANDOM_NUM(0, 100, ' + keep + ')' : 'RANDOM_INT(0, 100)')
              }
              else {
                config += prefix + (dotIndex < 0 && value <= 10
                    ? 'ORDER_INT(0, 10)'
                    : ((hasDot ? 'RANDOM_NUM' : 'RANDOM_INT') + '(0, ' + 100*value + (hasDot ? ', ' + keep + ')' : ')'))
                  )
                var hasDot = String(value).indexOf('.') >= 0
                if (value < 0) {
                  config += prefix + (hasDot ? 'RANDOM_NUM' : 'RANDOM_INT') + '(' + (100 * value) + ', 0)'
                }
                else if (value > 0 && value < 1) {  // 0-1 比例
                  config += prefix + 'RANDOM_NUM(0, 1)'
                }
                else if (value >= 0 && value <= 100) {  // 10% 百分比
                  config += prefix + 'RANDOM_INT(0, 100)'
                }
                else {
                  config += prefix + (hasDot != true && value < 10 ? 'ORDER_INT(0, 9)' : ((hasDot ? 'RANDOM_NUM' : 'RANDOM_INT') + '(0, ' + 100 * value + ')'))
                }
              }
            }
          }
          else if (typeof value == 'string') {
            if (isAPIJSON) {
              //引用赋值 || 远程函数 || 匹配条件范围
              if (key.endsWith('@') || key.endsWith('()') || key.endsWith('{}')) {
                return config
              }
            }

            config += prefix + 'ORDER_IN(undefined, null, ""' + (value == '' ? ')' : ', "' + value + '")')
          }
          else {
            config += prefix + 'ORDER_IN(undefined, null' + (value == null ? ')' : ', ' + JSON.stringify(value) + ')')
          }

        }

        return config
      },



      // 保存配置
      saveConfig: function () {
        App.isConfigShow = App.exTxt.index == 8

        switch (App.exTxt.index) {
          case 0:
            App.database = App.exTxt.name
            App.saveCache('', 'database', App.database)

            doc = null
            var item = App.accounts[App.currentAccountIndex]
            item.isLoggedIn = false
            App.onClickAccount(App.currentAccountIndex, item)
            break
          case 1:
            App.schema = App.exTxt.name
            App.saveCache('', 'schema', App.schema)

            doc = null
            var item = App.accounts[App.currentAccountIndex]
            item.isLoggedIn = false
            App.onClickAccount(App.currentAccountIndex, item)
            break
          case 2:
            App.language = App.exTxt.name
            App.saveCache('', 'language', App.language)

            doc = null
            App.onChange(false)
            break
          case 6:
            App.server = App.exTxt.name
            App.saveCache('', 'server', App.server)
            App.logout(true)
            break
          case 7:
            App.types = StringUtil.split(App.exTxt.name)
            App.saveCache('', 'types', App.types)
            break
          case 8:
            App.swagger = App.exTxt.name
            App.saveCache('', 'swagger', App.swagger)

            App.request(false, REQUEST_TYPE_PARAM, App.swagger, {}, {}, function (url, res, err) {
              if (App.isSyncing) {
                alert('正在同步，请等待完成')
                return
              }
              App.isSyncing = true
              App.onResponse(url, res, err)

              var apis = (res.data || {}).paths
              if (apis == null) { // || apis.length <= 0) {
                alert('没有查到 Swagger 文档！请开启跨域代理，并检查 URL 是否正确！')
                return
              }
              App.exTxt.button = '...'

              App.uploadTotal = 0 // apis.length || 0
              App.uploadDoneCount = 0
              App.uploadFailCount = 0

              var item
              // var i = 0
              for (var url in apis) {
                item = apis[url]
                //导致 url 全都是一样的  setTimeout(function () {
                  if (App.uploadSwaggerApi(url, item, 'get')
                    || App.uploadSwaggerApi(url, item, 'post')
                    || App.uploadSwaggerApi(url, item, 'put')
                    || App.uploadSwaggerApi(url, item, 'delete')
                  ) {}
                // }, 100*i)
                // i ++
              }


            })
            break
        }
      },

      /**上传 Swagger API
       * @param url
       * @param docItem
       * @param method
       * @param callback
       */
      uploadSwaggerApi: function(url, docItem, method, callback) {
        method = method || 'get'
        var api = docItem == null ? null : docItem[method]
        if (api == null) {
          log('postApi', 'api == null  >> return')
          App.exTxt.button = 'All:' + App.uploadTotal + '\nDone:' + App.uploadDoneCount + '\nFail:' + App.uploadFailCount
          return false
        }

        App.uploadTotal ++

        var req = '{'
        var parameters = api.parameters || []
        var paraItem
        for (var k = 0; k < parameters.length; k++) {
          paraItem = parameters[k] || {}
          var name = paraItem.name || ''
          if (name == 'mock') {
            continue
          }
          var val = paraItem.default
          if (val == undefined) {
            if (paraItem.type == 'boolean') {
              val = 'true'
            }
            if (paraItem.type == 'integer') {
              val = name == 'pageSize' ? '10' : '1'
            }
            else if (paraItem.type == 'string') {
              val = '""'
            }
            else if (paraItem.type == 'object') {
              val = '{}'
            }
            else if (paraItem.type == 'array') {
              val = '[]'
            }
            else {
              var suffix = name.length >= 3 ? name.substring(name.length - 3).toLowerCase() : null
              if (suffix == 'req' || suffix == 'dto') {
                val = '{}'
              } else {
                val = 'null'
              }
            }
          }
          else if (typeof val == 'string') {
            val = '"' + val + '"'
          }
          else if (val instanceof Object) {
            val = JSON.stringify(val, null, '    ')
          }

          req += '\n    "' + paraItem.name + '": ' + val + (k < parameters.length - 1 ? ',' : '')
            + (StringUtil.isEmpty(paraItem.description) ? '' : '  //' + paraItem.description)
        }
        req += '\n}'

        var currentAccountId = App.getCurrentAccountId()
        App.request(true, REQUEST_TYPE_JSON, App.server + '/post', {
          format: false,
          'Document': {
            'userId': App.User.id,
            'testAccountId': currentAccountId,
            'type': method == 'get' ? REQUEST_TYPE_PARAM : REQUEST_TYPE_JSON,
            'name': StringUtil.get(api.summary),
            'url': url,
            'request': req,
            'header': api.headers
          },
          'TestRecord': {
            'documentId@': '/Document/id',
            'randomId': 0,
            'userId': App.User.id,
            'host': App.getBaseUrl(),
            'testAccountId': currentAccountId,
            'response': ''
          },
          'tag': 'Document'
        }, {}, function (url, res, err) {
          //太卡 App.onResponse(url, res, err)
          if (res.data != null && res.data.code == CODE_SUCCESS) {
            App.uploadDoneCount ++
          } else {
            App.uploadFailCount ++
          }

          App.exTxt.button = 'All:' + App.uploadTotal + '\nDone:' + App.uploadDoneCount + '\nFail:' + App.uploadFailCount
          if (App.uploadDoneCount + App.uploadFailCount >= App.uploadTotal) {
            alert('导入完成')
            App.showTestCase(false, false)
            App.remotes = []
            App.showTestCase(true, false)
          }

        })

        return true
      },

      // 切换主题
      switchTheme: function (index) {
        this.checkedTheme = index
        localforage.setItem('#theme', index)
      },


      // APIJSON <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

      //格式化日期
      formatDate: function (date) {
        if (date == null) {
          date = new Date()
        }
        return date.getFullYear() + '-' + App.fillZero(date.getMonth() + 1) + '-' + App.fillZero(date.getDate())
      },
      //格式化时间
      formatTime: function (date) {
        if (date == null) {
          date = new Date()
        }
        return App.fillZero(date.getHours()) + ':' + App.fillZero(date.getMinutes())
      },
      formatDateTime: function (date) {
        if (date == null) {
          date = new Date()
        }
        return App.formatDate(date) + ' ' + App.formatTime(date)
      },
      //填充0
      fillZero: function (num, n) {
        if (num == null) {
          num = 0
        }
        if (n == null || n <= 0) {
          n = 2
        }
        var len = num.toString().length;
        while(len < n) {
          num = "0" + num;
          len++;
        }
        return num;
      },






      onClickAccount: function (index, item, callback) {
        if (this.currentAccountIndex == index) {
          if (item == null) {
            if (callback != null) {
              callback(false, index)
            }
          }
          else {
            this.setRememberLogin(item.remember)
            vAccount.value = item.phone
            vPassword.value = item.password

            if (item.isLoggedIn) {
              //logout FIXME 没法自定义退出，浏览器默认根据url来管理session的
              this.logout(false, function (url, res, err) {
                App.onResponse(url, res, err)

                item.isLoggedIn = false
                App.saveCache(App.getBaseUrl(), 'currentAccountIndex', App.currentAccountIndex)
                App.saveCache(App.getBaseUrl(), 'accounts', App.accounts)

                if (callback != null) {
                  callback(false, index, err)
                }
              });
            }
            else {
              //login
              this.login(false, function (url, res, err) {
                App.onResponse(url, res, err)

                var data = res.data || {}
                var isAPIJSON = App.isAPIJSON()
                var isGraphQL = App.isGraphQL()

                if (App.isSuccess(data, isAPIJSON, isGraphQL)) {
                  var user = (isAPIJSON ? data.user : data.data) || {}
                  if (isGraphQL) {
                    user = user.loginByPassword
                  }

                  if (user != null) {
                    item.id = isAPIJSON ? user.id : user.userId
                    item.name = user.name
                    item.remember = data.remember
                    item.isLoggedIn = true

                    App.saveCache(App.getBaseUrl(), 'currentAccountIndex', App.currentAccountIndex)
                    App.saveCache(App.getBaseUrl(), 'accounts', App.accounts)

                    if (callback != null) {
                      callback(true, index, err)
                    }
                    return
                  }
                }

                if (callback != null) {
                  callback(false, index, err)
                }
              });
            }

          }

          return;
        }

        //退出当前账号
        var c = this.currentAccountIndex
        var it = c == null || this.accounts == null ? null : this.accounts[c];
        if (it != null) { //切换 BASE_URL后 it = undefined 导致UI操作无法继续
          it.isLoggedIn = false  //异步导致账号错位 this.onClickAccount(c, this.accounts[c])
        }

        //切换到这个tab
        this.currentAccountIndex = index

        //目前还没做到同一标签页下测试账号切换后，session也跟着切换，所以干脆每次切换tab就重新登录
        if (item != null) {
          item.isLoggedIn = false
          this.onClickAccount(index, item, callback)
        }
        else {
          if (callback != null) {
              callback(false, index)
          }
        }
      },

      isSuccess(data, isAPIJSON, isGraphQL) {
        if (data == null) {
          return false
        }
        if (isAPIJSON == null) {
          isAPIJSON = this.isAPIJSON()
        }
        if (isAPIJSON == true) {
          return data.code == CODE_SUCCESS
        }

        if (isGraphQL == null) {
          isGraphQL = this.isGraphQL()
        }
        if (isGraphQL == true) {
          return data.errors == null || data.errors.length <= 0
        }

        return true
      },

      removeAccountTab: function () {
        if (App.accounts.length <= 1) {
          alert('至少要 1 个测试账号！')
          return
        }

        App.accounts.splice(App.currentAccountIndex, 1)
        if (App.currentAccountIndex >= App.accounts.length) {
          App.currentAccountIndex = App.accounts.length - 1
        }

        App.saveCache(App.getBaseUrl(), 'currentAccountIndex', App.currentAccountIndex)
        App.saveCache(App.getBaseUrl(), 'accounts', App.accounts)
      },
      addAccountTab: function () {
        this.showLogin(true, false)
      },


      //显示远程的测试用例文档
      showTestCase: function (show, isLocal) {
        App.isTestCaseShow = show
        App.isLocalShow = isLocal

        vOutput.value = show ? '' : (output || '')
        App.showDoc()

        if (isLocal) {
          App.testCases = App.locals || []
          return
        }
        App.testCases = App.remotes || []

        if (show) {
          var testCases = App.testCases
          var allCount = testCases == null ? 0 : testCases.length
          if (allCount > 0) {
            var accountIndex = (App.accounts[App.currentAccountIndex] || {}).isLoggedIn ? App.currentAccountIndex : -1
            App.currentAccountIndex = accountIndex  //解决 onTestResponse 用 -1 存进去， handleTest 用 currentAccountIndex 取出来为空

            var tests = App.tests[String(accountIndex)] || {}
            if (tests != null && $.isEmptyObject(tests) != true) {
              for (var i = 0; i < allCount; i++) {
                var item = testCases[i]
                if (item == null) {
                  continue
                }
                var d = item.Document || {}
                App.compareResponse(allCount, i, item, (tests[d.id] || {})[0], false, accountIndex, true)
              }
            }
            return;
          }

          App.isTestCaseShow = false

          var search = StringUtil.isEmpty(App.testCaseSearch, true) ? null : StringUtil.trim(App.testCaseSearch)
          var url = App.server + '/get'

          var req = {
            format: false,
            '[]': {
              'count': App.testCaseCount || 50, //200 条测试直接卡死 0,
              'page': App.testCasePage,
              'Document': {
                '@order': 'version-,date-',
                'userId': App.User.id,
                'name*~': search,
                'url*~': search,
                '@combine': search == null ? null : 'name*~,url*~'
              },
              'TestRecord': {
                'documentId@': '/Document/id',
                'testAccountId': App.getCurrentAccountId(),
                'randomId': 0,
                '@order': 'date-',
                '@column': 'id,userId,documentId,response' + (App.isMLEnabled ? ',standard' : ''),
                'userId': App.User.id,
                '@having': App.isMLEnabled ? 'length(standard)>2' : null  //用 MySQL 5.6   '@having': App.isMLEnabled ? 'json_length(standard)>0' : null
              }
            },
            '@role': 'LOGIN'
          }

          App.onChange(false)
          App.request(true, REQUEST_TYPE_JSON, url, req, {}, function (url, res, err) {
            App.onResponse(url, res, err)

            var rpObj = res.data

            if (rpObj != null && rpObj.code === 200) {
              App.isTestCaseShow = true
              App.isLocalShow = false
              App.testCases = App.remotes = rpObj['[]']
              vOutput.value = show ? '' : (output || '')
              App.showDoc()

              //App.onChange(false)
            }
          })
        }
      },

      //显示远程的测试用例文档
      showRandomList: function (show, item) {
        App.isRandomListShow = show

        vOutput.value = show ? '' : (output || '')
        App.showDoc()

        App.randoms = App.randoms || []

        if (show && App.isRandomShow && App.randoms.length <= 0 && item != null && item.id != null) {
          App.isRandomListShow = false

          var url = App.server + '/get'
          var req = {
            '[]': {
              'count': 0,
              'Random': {
                'documentId': item.id,
                '@order': 'date-'
              },
              'TestRecord': {
                'randomId@': '/Random/id',
                'testAccountId': App.getCurrentAccountId(),
                'host': App.getBaseUrl(),
                '@order': 'date-'
              }
            }
          }

          App.onChange(false)
          App.request(true, REQUEST_TYPE_JSON, url, req, {}, function (url, res, err) {
            App.onResponse(url, res, err)

            var rpObj = res.data

            if (rpObj != null && rpObj.code === 200) {
              App.isRandomListShow = true
              App.randoms = rpObj['[]']
              vOutput.value = show ? '' : (output || '')
              App.showDoc()

              //App.onChange(false)
            }
          })
        }
      },


      // 设置文档
      showDoc: function () {
        if (this.setDoc(doc) == false) {
          this.getDoc(function (d) {
            App.setDoc(d);
          });
        }
      },


      saveCache: function (url, key, value) {
        var cache = this.getCache(url);
        cache[key] = value
        localStorage.setItem('APIAuto:' + url, JSON.stringify(cache))
      },
      getCache: function (url, key) {
        var cache = localStorage.getItem('APIAuto:' + url)
        try {
          cache = JSON.parse(cache)
        } catch(e) {
          App.log('login  App.send >> try { cache = JSON.parse(cache) } catch(e) {\n' + e.message)
        }
        cache = cache || {}
        return key == null ? cache : cache[key]
      },

      /**登录确认
       */
      confirm: function () {
        switch (App.loginType) {
          case 'login':
            App.login(App.isAdminOperation)
            break
          case 'register':
            App.register(App.isAdminOperation)
            break
          case 'forget':
            App.resetPassword(App.isAdminOperation)
            break
        }
      },

      showLogin(show, isAdmin) {
        App.isLoginShow = show
        App.isAdminOperation = isAdmin

        if (show != true) {
          return
        }

        var user = isAdmin ? App.User : null //add account   App.accounts[App.currentAccountIndex]

        // alert("showLogin  isAdmin = " + isAdmin + "; user = \n" + JSON.stringify(user, null, '    '))

        if (user == null) {
          user = {
            phone: 13000082001,
            password: 123456
          }
        }

        this.setRememberLogin(user.remember)
        vAccount.value = user.phone
        vPassword.value = user.password
      },

      setRememberLogin(remember) {
        vRemember.checked = remember || false
      },

      getCurrentAccount: function() {
        return App.accounts == null ? null : App.accounts[App.currentAccountIndex]
      },
      getCurrentAccountId: function() {
        var a = App.getCurrentAccount()
        return a != null && a.isLoggedIn ? a.id : null
      },

      /**登录
       */
      login: function (isAdminOperation, callback) {
        App.isLoginShow = false

        const req = {
          type: 0, // 登录方式，非必须 0-密码 1-验证码
          phone: vAccount.value,
          password: vPassword.value,
          version: 1, // 全局默认版本号，非必须
          remember: vRemember.checked,
          format: false,
          defaults: {
            '@database': App.database,
            '@schema': App.schema
          }
        }

        if (isAdminOperation) {
          App.request(isAdminOperation, REQUEST_TYPE_JSON, App.server + '/login', req, {}, function (url, res, err) {
            if (callback != null) {
              callback(url, res, err)
              return
            }

            var rpObj = res.data || {}

            if (rpObj.code != 200) {
              alert('登录失败，请检查网络后重试。\n' + rpObj.msg + '\n详细信息可在浏览器控制台查看。')
            }
            else {
              var user = rpObj.user || {}

              if (user.id > 0) {
                user.remember = rpObj.remember
                user.phone = req.phone
                user.password = req.password
                App.User = user
              }

              //保存User到缓存
              App.saveCache(App.server, 'User', user)

              if (App.currentAccountIndex == null || App.currentAccountIndex < 0) {
                App.currentAccountIndex = 0
              }
              var item = App.accounts[App.currentAccountIndex]
              item.isLoggedIn = false
              App.onClickAccount(App.currentAccountIndex, item) //自动登录测试账号
            }

          })
        }
        else {
          if (callback == null) {
            var item
            for (var i in App.accounts) {
              item = App.accounts[i]
              if (item != null && req.phone == item.phone) {
                alert(req.phone +  ' 已在测试账号中！')
                // App.currentAccountIndex = i
                item.remember = vRemember.checked
                App.onClickAccount(i, item)
                return
              }
            }
          }


          var isAPIJSON = App.isAPIJSON()
          var isGraphQL = App.isGraphQL()
          App.showUrl(isAdminOperation, isAPIJSON ? '/login' : (isGraphQL ? '/graphql' : 'login'))

          vInput.value = JSON.stringify(req, null, App.indent)

          App.type = isGraphQL ? REQUEST_TYPE_GQL : REQUEST_TYPE_JSON
          App.showTestCase(false, App.isLocalShow)
          App.onChange(false)
          App.send(isAdminOperation, function (url, res, err) {
            if (callback) {
              callback(url, res, err)
              return
            }

            App.onResponse(url, res, err)

            //由login按钮触发，不能通过callback回调来实现以下功能
            var data = res.data || {}
            if (data.code == CODE_SUCCESS) {
              var user = data.user || {}
              App.accounts.push({
                isLoggedIn: true,
                id: user.id,
                name: user.name,
                phone: req.phone,
                password: req.password,
                remember: data.remember
              })

              var lastItem = App.accounts[App.currentAccountIndex]
              if (lastItem != null) {
                lastItem.isLoggedIn = false
              }

              App.currentAccountIndex = App.accounts.length - 1

              App.saveCache(App.getBaseUrl(), 'currentAccountIndex', App.currentAccountIndex)
              App.saveCache(App.getBaseUrl(), 'accounts', App.accounts)
            }
          })
        }
      },

      /**注册
       */
      register: function (isAdminOperation) {
        App.showUrl(isAdminOperation, '/register')
        vInput.value = JSON.stringify(
          {
            Privacy: {
              phone: vAccount.value,
              _password: vPassword.value
            },
            User: {
              name: 'APIJSONUser'
            },
            verify: vVerify.value
          },
          null, App.indent)
        App.type = REQUEST_TYPE_JSON
        App.showTestCase(false, false)
        App.onChange(false)
        App.send(isAdminOperation, function (url, res, err) {
          App.onResponse(url, res, err)

          var rpObj = res.data
          if (rpObj != null && rpObj.code === 200) {
            alert('注册成功')

            var privacy = rpObj.Privacy || {}

            vAccount.value = privacy.phone
            App.loginType = 'login'
          }
        })
      },

      /**重置密码
       */
      resetPassword: function (isAdminOperation) {
        App.showUrl(isAdminOperation, '/put/password')
        vInput.value = JSON.stringify(
          {
            verify: vVerify.value,
            Privacy: {
              phone: vAccount.value,
              _password: vPassword.value
            }
          },
          null, App.indent)
        App.type = REQUEST_TYPE_JSON
        App.showTestCase(false, App.isLocalShow)
        App.onChange(false)
        App.send(isAdminOperation, function (url, res, err) {
          App.onResponse(url, res, err)

          var rpObj = res.data

          if (rpObj != null && rpObj.code === 200) {
            alert('重置密码成功')

            var privacy = rpObj.Privacy || {}

            vAccount.value = privacy.phone
            App.loginType = 'login'
          }
        })
      },

      /**退出
       */
      logout: function (isAdminOperation, callback) {
        var req = {}

        if (isAdminOperation) {
          // alert('logout  isAdminOperation  this.saveCache(App.server, User, {})')
          this.saveCache(App.server, 'User', {})
        }

        // alert('logout  isAdminOperation = ' + isAdminOperation + '; url = ' + url)
        if (isAdminOperation) {
          this.request(isAdminOperation, REQUEST_TYPE_JSON, this.server + '/logout', req, {}, function (url, res, err) {
            if (callback) {
              callback(url, res, err)
              return
            }

            // alert('logout  clear admin ')

            App.clearUser()
            App.onResponse(url, res, err)
            App.showTestCase(false, App.isLocalShow)
          })
        }
        else {
          var isAPIJSON = this.isAPIJSON()
          var isGraphQL = this.isGraphQL()
          this.type = isAPIJSON ? REQUEST_TYPE_JSON : (isGraphQL ? REQUEST_TYPE_GQL : REQUEST_TYPE_PARAM)
          this.showUrl(isAdminOperation, isAPIJSON ? '/logout' : (isGraphQL ? '/graphql' : '/user/logout'))

          vInput.value = '{}'
          vGraphQLInput.value = '{\n  logout\n}'
          this.showTestCase(false, this.isLocalShow)
          this.onChange(false)
          this.send(isAdminOperation, callback)
        }
      },

      /**获取验证码
       */
      getVerify: function (isAdminOperation) {
        App.showUrl(isAdminOperation, '/post/verify')
        var type = App.loginType == 'login' ? 0 : (App.loginType == 'register' ? 1 : 2)
        vInput.value = JSON.stringify(
          {
            type: type,
            phone: vAccount.value
          },
          null, App.indent)
        App.type = REQUEST_TYPE_JSON
        App.showTestCase(false, App.isLocalShow)
        App.onChange(false)
        App.send(isAdminOperation, function (url, res, err) {
          App.onResponse(url, res, err)

          var data = res.data || {}
          var obj = data.code == 200 ? data.verify : null
          var verify = obj == null ? null : obj.verify
          if (verify != null) { //FIXME isEmpty校验时居然在verify=null! StringUtil.isEmpty(verify, true) == false) {
            vVerify.value = verify
          }
        })
      },

      clearUser: function () {
        this.User.id = 0
        this.Privacy = {}
        this.remotes = []
        this.saveCache(App.server, 'User', App.User) //应该用lastBaseUrl,baseUrl应随watch输入变化重新获取
      },

      /**计时回调
       */
      onHandle: function (before) {
        this.isDelayShow = false
        if (inputted != before) {
          clearTimeout(handler);
          return;
        }

        App.view = 'output';
        vComment.value = '';
        vUrlComment.value = '';
        vOutput.value = 'resolving...';

        //格式化输入代码
        try {
          try {
            this.header = this.getHeader(vHeader.value)
          } catch (e2) {
            this.isHeaderShow = true
            vHeader.select()
            throw new Error(e2.message)
          }

          before = App.toDoubleJSON(before);
          log('onHandle  before = \n' + before);

          var afterObj;
          var after;
          try {
            afterObj = jsonlint.parse(before);
            after = JSON.stringify(afterObj, null, App.indent);
            before = after;
          }
          catch (e) {
            log('main.onHandle', 'try { return jsonlint.parse(before); \n } catch (e) {\n' + e.message)
            log('main.onHandle', 'return jsonlint.parse(App.removeComment(before));')

            try {
              afterObj = jsonlint.parse(App.removeComment(before));
              after = JSON.stringify(afterObj, null, App.indent);
            } catch (e2) {
              throw new Error('Wrong JSON format! Check and edit it! \n\nYou can remove all comments and retry\n\n' + e2.message)
            }
          }

          //关键词let在IE和Safari上不兼容
          var code = '';
          try {
            code = this.getCode(after); //必须在before还是用 " 时使用，后面用会因为解析 ' 导致失败
          } catch(e) {
            code = '\n\n\nTips:\nUse Chrome, FireFox or Edge to generate code'
              + '\nError:\n' + e.message + '\n\n\n';
          }

          if (isSingle) {
            if (before.indexOf('"') >= 0) {
              before = before.replace(/"/g, "'");
            }
          }
          else {
            if (before.indexOf("'") >= 0) {
              before = before.replace(/'/g, '"');
            }
          }

          vInput.value = before;
          vSend.disabled = false;
          vOutput.value = output = 'OK, click [Send] to test. [Click here to watch video](http://i.youku.com/apijson)' + code;


          App.showDoc()

          try {
            var m = App.getMethod();
            var c = isSingle ? '' : CodeUtil.parseComment(after, docObj == null ? null : docObj['[]'], m, App.database, null, true)

            if (isSingle != true && afterObj.tag == null) {
              m = m == null ? 'GET' : m.toUpperCase()
              if (['GETS', 'HEADS', 'POST', 'PUT', 'DELETE'].indexOf(m) >= 0) {
                c += ' ! 非开放请求必须设置 tag ！例如 "tag": "User"'
              }
            }
            vComment.value = c
            vUrlComment.value = isSingle || StringUtil.isEmpty(App.urlComment, true)
              ? '' : vUrl.value + CodeUtil.getComment(App.urlComment, false, '  ')
              + ' - ' + (App.requestVersion > 0 ? 'V' + App.requestVersion : 'V*');

            onScrollChanged()
            onURLScrollChanged()
          } catch (e) {
            log('onHandle   try { vComment.value = CodeUtil.parseComment >> } catch (e) {\n' + e.message);
          }
        } catch(e) {
          log(e)
          vSend.disabled = true

          App.view = 'error'
          App.error = {
            msg: e.message
          }
        }
      },


      /**输入内容改变
       */
      onChange: function (delay) {
        this.setBaseUrl();
        inputted = new String(vInput.value);
        vComment.value = '';
        vUrlComment.value = '';

        clearTimeout(handler);

        this.isDelayShow = delay;

        handler = setTimeout(function () {
          App.onHandle(inputted);
        }, delay ? 2*1000 : 0);
      },

      /**单双引号切换
       */
      transfer: function () {
        isSingle = ! isSingle;

        this.isTestCaseShow = false

        // // 删除注释 <<<<<<<<<<<<<<<<<<<<<
        //
        // var input = this.removeComment(vInput.value);
        // if (vInput.value != input) {
        //   vInput.value = input
        // }
        //
        // // 删除注释 >>>>>>>>>>>>>>>>>>>>>

        this.onChange(false);
      },

      /**获取显示的请求类型名称
       */
      getTypeName: function (type) {
        var ts = this.types
        var t = type || REQUEST_TYPE_JSON
        if (ts == null || ts.length <= 1 || (ts.length <= 2 && ts.indexOf(REQUEST_TYPE_PARAM) >= 0)) {
          return t == REQUEST_TYPE_PARAM ? 'GET' : 'POST'
        }
        return t
      },
      /**请求类型切换
       */
      changeType: function () {
        var count = this.types == null ? 0 : this.types.length
        if (count > 1) {
          var index = this.types.indexOf(this.type)
          index++;
          this.type = this.types[index % count]
        }
        this.indent = this.type == REQUEST_TYPE_GQL ? '  ' : '    '

        var url = StringUtil.get(vUrl.value)
        var index = url.indexOf('?')
        if (index >= 0) {
          var params = StringUtil.split(url.substring(index + 1), '&')

          var paramObj = {}
          var p
          var v
          var ind
          if (params != null) {
            for (var i = 0; i < params.length; i++) {
              p = params[i]
              ind = p == null ? -1 : p.indexOf('=')
              if (ind < 0) {
                continue
              }

              v = p.substring(ind + 1)
              try {
                v = JSON.parse(v)
              }
              catch (e) {}

              paramObj[p.substring(0, ind)] = v
            }
          }

          vUrl.value = url.substring(0, index)
          if ($.isEmptyObject(paramObj) == false) {
            vInput.value = '//TODO 从 URL 上的参数转换过来：\n' +  JSON.stringify(paramObj, null, App.indent) + '\n//FIXME 需要与下面原来的字段合并为一个 JSON：\n' + StringUtil.get(vInput.value)
          }
          clearTimeout(handler)  //解决 vUrl.value 和 vInput.value 变化导致刷新，而且会把 vInput.value 重置，加上下面 onChange 再刷新就卡死了
        }

        this.onChange(false);
      },

      /**
       * 删除注释
       */
      removeComment: function (json) {
        var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n))|(\/\*(\n|.)*?\*\/)/g // 正则表达式
        try {
          return new String(json).replace(reg, function(word) { // 去除注释后的文本
            return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word;
          })
        } catch (e) {
          log('transfer  delete comment in json >> catch \n' + e.message);
        }
        return json;
      },

      showAndSend: function (branchUrl, req, isAdminOperation, callback) {
        App.showUrl(isAdminOperation, branchUrl)
        vInput.value = JSON.stringify(req, null, App.indent)
        App.showTestCase(false, App.isLocalShow)
        App.onChange(false)
        App.send(isAdminOperation, callback)
      },

      /**发送请求
       */
      send: function(isAdminOperation, callback) {
        if (this.isTestCaseShow) {
          alert('请先输入请求内容！')
          return
        }

        if (StringUtil.isEmpty(App.host, true)) {

          var url = StringUtil.get(vUrl.value)
          if (url.startsWith('http://') != true && url.startsWith('https://') != true && url.startsWith('/') != true) {
            alert('URL 缺少 http:// 或 https:// 前缀，可能不完整或不合法，\n可能使用同域的 Host，很可能访问出错！')
          }
        }
        else {
          if (StringUtil.get(vUrl.value).indexOf('://') >= 0) {
            alert('URL Host 已经隐藏(固定) 为 \n' + App.host + ' \n将会自动在前面补全，导致 URL 不合法访问出错！\n如果要改 Host，右上角设置 > 显示(编辑)URL Host')
          }
        }

        this.onHandle(vInput.value)

        clearTimeout(handler)

        var header
        try {
          header = this.getHeader(vHeader.value)
        } catch (e) {
          // alert(e.message)
          return
        }

        var type = this.type
        var req = this.getRequest(vInput.value, null, type == REQUEST_TYPE_GQL ? StringUtil.get(vGraphQLInput.value) : null)
        var url = this.getUrl()

        vOutput.value = "requesting... \nURL = " + url
        this.view = 'output';


        this.setBaseUrl()
        this.request(isAdminOperation, type, url, req, isAdminOperation ? {} : header, callback)

        this.locals = this.locals || []
        if (this.locals.length >= 1000) { //最多1000条，太多会很卡
          this.locals.splice(999, this.locals.length - 999)
        }
        var method = App.getMethod()
        this.locals.unshift({
          'Document': {
            'userId': App.User.id,
            'name': App.formatDateTime() + (StringUtil.isEmpty(req.tag, true) ? '' : ' ' + req.tag),
            'type': type,
            'url': '/' + method,
            'request': JSON.stringify(req, null, '  '),
            'header': vHeader.value
          }
        })
        this.saveCache('', 'locals', this.locals)
      },

      //请求
      request: function (isAdminOperation, type, url, req, header, callback) {
        type = type || REQUEST_TYPE_JSON

        // axios.defaults.withcredentials = true
        axios({
          method: (type == REQUEST_TYPE_PARAM ? 'get' : 'post'),
          url: (isAdminOperation == false && this.isDelegateEnabled ? (this.server + '/delegate?$_delegate_url=') : '' ) + StringUtil.noBlank(url),
          params: (type == REQUEST_TYPE_PARAM || type == REQUEST_TYPE_FORM ? req : null),
          data: (type == REQUEST_TYPE_GQL || type == REQUEST_TYPE_JSON ? req : (type == REQUEST_TYPE_DATA ? toFormData(req) : null)),
          headers: header,  //Accept-Encoding（HTTP Header 大小写不敏感，SpringBoot 接收后自动转小写）可能导致 Response 乱码
          withCredentials: true //Cookie 必须要  type == REQUEST_TYPE_JSON
        })
          .then(function (res) {
            res = res || {}
	    //any one of then callback throw error will cause it calls then(null)
            // if ((res.config || {}).method == 'options') {
            //   return
            // }
            log('send >> success:\n' + JSON.stringify(res, null, '  '))

            //未登录，清空缓存
            if (res.data != null && res.data.code == 407) {
              // alert('request res.data != null && res.data.code == 407 >> isAdminOperation = ' + isAdminOperation)
              if (isAdminOperation) {
                // alert('request App.User = {} App.server = ' + App.server)

                App.clearUser()
              }
              else {
                // alert('request App.accounts[App.currentAccountIndex].isLoggedIn = false ')

                if (App.accounts[App.currentAccountIndex] != null) {
                  App.accounts[App.currentAccountIndex].isLoggedIn = false
                }
              }
            }

            if (callback != null) {
              callback(url, res, null)
              return
            }
            App.onResponse(url, res, null)
          })
          .catch(function (err) {
            log('send >> error:\n' + err)
            if (callback != null) {
              callback(url, {}, err)
              return
            }
            App.onResponse(url, {}, err)
          })
      },


      /**请求回调
       */
      onResponse: function (url, res, err) {
        log('onResponse url = ' + url + '\nerr = ' + err + '\nres = \n' + (res == null ? 'null' : JSON.stringify(res)))
        if (err != null) {
          vOutput.value = "Response:\nurl = " + url + "\nerror = " + err.message;
          this.view = 'output'
          return
        }

        var data = (res || {}).data
        if (data != null && data instanceof Object) {
          var isAPIJSON = this.isAPIJSON(url)
          var isSuccess = this.isSuccess(data, isAPIJSON, this.isGraphQL(url))
          if (isSingle && isAPIJSON && isSuccess) { //不格式化错误的结果
            data = JSONResponse.formatObject(data)
          }

          vOutput.value = ''
          this.view = 'code'
          this.showJsonView(data, CodeUtil.getTableFromUrl(url))  //jsoncon watch 到改变就会渲染，这次是之后额外的一次，为了能显示 Response hint
        }
        else {
          //把字符串强行拆分成对象 { 0: "A", 1: "P", 2: "I" ... }
          //必须保留对 jsoncon 赋值，否则回归测试后前后对比，后 为 {}
          // this.jsoncon = JSON.stringify(data) //Error: 在第 1 行发生解析错误  data
          vOutput.value = data == null ? '' : JSON.stringify(data)
          this.view = 'output'
        }

      },


      /**处理按键事件
       * @param event
       */
      doOnKeyUp: function (event, isPage, isTestCase) {
        var keyCode = event.keyCode ? event.keyCode : (event.which ? event.which : event.charCode);
        if (keyCode == 13) { // enter
          if (isPage) {
            if (isTestCase) {
              this.testCasePage = vTestCasePage.value
              this.testCaseCount = vTestCaseCount.value
              this.testCaseSearch = vTestCaseSearch.value
            }
            else {
              this.page = vPage.value
              this.count = vCount.value
              this.search = vSearch.value
            }

            this.onPageChange(isTestCase)
            return
          }
          this.send(false);
        }
        else {
          if (isPage) {
            return
          }
          App.urlComment = '';
          App.requestVersion = '';
          this.onChange(true);
        }
      },

      pageDown: function(isTestCase) {
        var page = isTestCase ? this.testCasePage : this.page
        if (page == null) {
          page = 0
        }
        if (page > 0) {
          page --
          if (isTestCase) {
            this.testCasePage = page
          }
          else {
            this.page = page
          }
          this.onPageChange(isTestCase)
        }
      },
      pageUp: function(isTestCase) {
        if (isTestCase) {
          this.testCasePage ++
        }
        else {
          this.page ++
        }
        this.onPageChange(isTestCase)
      },
      onPageChange: function(isTestCase) {
        if (isTestCase) {
          this.saveCache(this.server, 'testCasePage', this.testCasePage)
          this.saveCache(this.server, 'testCaseCount', this.testCaseCount)

          this.remotes = null
          this.showTestCase(true, false)
        }
        else {
          docObj = null
          doc = null
          this.saveCache(this.server, 'page', this.page)
          this.saveCache(this.server, 'count', this.count)
          this.saveCache(this.server, 'docObj', null)
          this.saveCache(this.server, 'doc', null)

          this.onChange(false)

          //虽然性能更好，但长时间没反应，用户会觉得未生效
          // this.getDoc(function (d) {
          //   // vOutput.value = 'resolving...';
          //   App.setDoc(d)
          //   App.onChange(false)
          // });
        }
      },

      /**转为请求代码
       * @param rq
       */
      getCode: function (rq) {
        var s = '\n\n\n### Generated code \n';
        switch (App.language) {
          case 'Java':
            s += '\n#### <= Android-Java: rename duplicated names'
              + ' \n ```java \n'
              + StringUtil.trim(CodeUtil.parseJava(null, JSON.parse(rq), 0, isSingle))
              + '\n ``` \nNote: ' + (isSingle ? 'Using JSONRequest in APIJSON, can replace with ordered JSONObject\n' : 'LinkedHashMap&lt;&gt;() can be replaced with JSONObject(true)\n');
            break;
          case 'Swift':
            s += '\n#### <= iOS-Swift: [ : ] for empty objects'
              + '\n ```swift \n'
              + CodeUtil.parseSwift(null, JSON.parse(rq), 0)
              + '\n ``` \nNote: ["key": value] for objects, [value0, value1] for arrays\n';
            break;
          case 'Kotlin':
            s += '\n#### <= Android-Kotlin: HashMap&lt;String, Any&gt;() for empty objects, ArrayList&lt;Any&gt;() for empty arrays\n'
              + '```kotlin \n'
              + CodeUtil.parseKotlin(null, JSON.parse(rq), 0)
              + '\n ``` \nNote: mapOf("key": value) for objects, listOf(value0, value1) for arrays\n';
            break;
          case 'Objective-C':
            s += '\n#### <= iOS-Objective-C \n ```objective-c \n'
              + CodeUtil.parseObjectiveC(null, JSON.parse(rq))
              + '\n ```  \n';
            break;
          case 'C#':
            s += '\n#### <= Unity3D-C\#: {"key", value} for objects' +
              '\n ```csharp \n'
              + CodeUtil.parseCSharp(null, JSON.parse(rq), 0)
              + '\n ``` \nNote: new JObject{{"key", value}} for objects, new JArray{value0, value1} for arrays\n';
            break;
          case 'PHP':
            s += '\n#### <= Web-PHP: (object) ' + (isSingle ? '[]' : 'array()') + ' for empty objects'
              + ' \n ```php \n'
              + CodeUtil.parsePHP(null, JSON.parse(rq), 0, isSingle)
              + '\n ``` \nNote: ' + (isSingle ? '[\'key\' => value]' : 'array("key" => value)') + ' for objects, ' + (isSingle ? '[value0, value1]\n' : 'array(value0, value1)\n') + ' for arrays';
            break;
          case 'Go':
            s += '\n#### <= Web-Go: key: value will be forcely sorted, append comma "," for every key: value'
              + ' \n ```go \n'
              + CodeUtil.parseGo(null, JSON.parse(rq), 0)
              + '\n ``` \nNote: map[string]interface{} {"key": value} for objects, []interface{} {value0, value1} for arrays\n';
            break;
          //以下都不需要解析，直接用左侧的 JSON
          case 'JavaScript':
          case 'TypeScript':
          case 'Python':
            break;
          default:
            s += '\nNo generated code, maybe because of wrong configuration of language.\n';
            break;
        }
        s += '\n#### <= Web-JavaScript/TypeScript/Python: The same to the JSON on the left\n';

        s += '\n\n#### Open source code '
          + '\nhttps://github.com/AutoGraphQL/AutoGraphQL '
          + '\nhttps://github.com/AutoGraphQL/GraphAuto '
          + '\n⭐ Star to support ^_^';

        return s;
      },


      /**显示文档
       * @param d
       **/
      setDoc: function (d) {
        if (d == null) { //解决死循环 || d == '') {
          return false;
        }
        doc = d;
        vOutput.value += (
          '\n\n\n## Document \n\n See [Document](https://github.com/AutoGraphQL/AutoGraphQL) \n### Data dictionary\ngenerate with properties of tables and columns \n\n' + d
          + '<h3 align="center">About</h3>'
          + '<p align="center">GraphAuto-Advanced GraphQL API tool with machine learning.'
          + '<br>Frontend: <a href="https://github.com/AutoGraphQL/GraphAuto" target="_blank">GraphAuto</a>, Backend: <a href="https://github.com/Tencent/APIJSON" target="_blank">APIJSON</a>'
          + '<br>Use <a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank">Apache-2.0</a>'
          + '<br>Copyright &copy; 2016-Now Tommy Lemon</p>'
        );

        App.view = 'markdown';
        markdownToHTML(vOutput.value);
        return true;
      },


      /**
       * 获取文档
       */
      getDoc: function (callback) {

        var search = StringUtil.isEmpty(App.search, true) ? null : StringUtil.trim(App.search)

        App.request(false, REQUEST_TYPE_JSON, this.getBaseUrl() + '/get', {
          format: false,
          '@database': App.database,
          'sql@': {
            'from': 'Access',
            'Access': {
              '@column': 'name'
            }
          },
          'Access[]': {
            'count': 0,
            'Access': {
              '@column': 'name,alias,get,head,gets,heads,post,put,delete',
              '@order': 'date-,name+',
              'name()': 'getWithDefault(alias,name)',
              'r0()': 'removeKey(alias)'
            }
          },
          '[]': {
            'count': App.count || 50,  //超过就太卡了
            'page': App.page || 0,
            'Table': App.database == 'SQLSERVER' ? null : {
              'table_schema': App.schema,
              'table_type': 'BASE TABLE',
              // 'table_name!$': ['\\_%', 'sys\\_%', 'system\\_%'],
              'table_name*~': search,
              'table_comment*~': search,
              '@combine': search == null ? null : 'table_name*~,table_comment*~',
              'table_name{}@': 'sql',
              '@order': 'table_name+', //MySQL 8 SELECT `table_name` 返回的仍然是大写的 TABLE_NAME，需要 AS 一下
              '@column': App.database == 'POSTGRESQL' ? 'table_name' : 'table_name:table_name,table_comment:table_comment'
            },
            'PgClass': App.database != 'POSTGRESQL' ? null : {
              'relname@': '/Table/table_name',
              //FIXME  多个 schema 有同名表时数据总是取前面的  不属于 pg_class 表 'nspname': App.schema,
              '@column': 'oid;obj_description(oid):table_comment'
            },
            'SysTable': App.database != 'SQLSERVER' ? null : {
              'name!$': [
                '\\_%',
                'sys\\_%',
                'system\\_%'
              ],
              '@order': 'name+',
              '@column': 'name:table_name,object_id'
            },
            'ExtendedProperty': App.database != 'SQLSERVER' ? null : {
              '@order': 'name+',
              'major_id@': '/SysTable/object_id',
              '@column': 'value:table_comment'
            },
            '[]': {
              'count': 0,
              'Column': {
                'table_schema': App.schema,
                'table_name@': App.database != 'SQLSERVER' ? '[]/Table/table_name' : "[]/SysTable/table_name",
                "@order": App.database != 'SQLSERVER' ? null : "table_name+",
                '@column': App.database == 'POSTGRESQL' || App.database == 'SQLSERVER'  //MySQL 8 SELECT `column_name` 返回的仍然是大写的 COLUMN_NAME，需要 AS 一下
                  ? 'column_name;data_type;numeric_precision,numeric_scale,character_maximum_length'
                  : 'column_name:column_name,column_type:column_type,column_comment:column_comment'
              },
              'PgAttribute': App.database != 'POSTGRESQL' ? null : {
                'attrelid@': '[]/PgClass/oid',
                'attname@': '/Column/column_name',
                'attnum>': 0,
                '@column': 'col_description(attrelid,attnum):column_comment'
              },
              'SysColumn': App.database != 'SQLSERVER' ? null : {
                'object_id@': '[]/SysTable/object_id',
                'name@': '/Column/column_name',
                '@order': 'object_id+',
                '@column': 'object_id,column_id'
              },
              'ExtendedProperty': App.database != 'SQLSERVER' ? null : {
                '@order': 'major_id+',
                'major_id@': '/SysColumn/object_id',
                'minor_id@': '/SysColumn/column_id',
                '@column': 'value:column_comment'
              }
            }
          },
          'Function[]': {
            'count': 0,
            'Function': {
              '@order': 'date-,name+',
              '@column': 'name,arguments,demo,detail',
              'demo()': 'getFunctionDemo()',
              'detail()': 'getFunctionDetail()',
              'r0()': 'removeKey(name)',
              'r1()': 'removeKey(arguments)'
            }
          },
          'Request[]': {
            'count': 0,
            'Request': {
              '@order': 'version-,method-',
              '@json': 'structure'
            }
          }
        }, {}, function (url, res, err) {
          if (err != null || res == null || res.data == null) {
            log('getDoc  err != null || res == null || res.data == null >> return;');
            callback('')
            return;
          }

//      log('getDoc  docRq.responseText = \n' + docRq.responseText);
          docObj = res.data || {};  //避免后面又调用 onChange ，onChange 又调用 getDoc 导致死循环

          //转为文档格式
          var doc = '';
          var item;

          //[] <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
          var list = docObj == null ? null : docObj['[]'];
          if (list != null) {
            if (DEBUG) {
              log('getDoc  [] = \n' + format(JSON.stringify(list)));
            }

            var table;
            var columnList;
            var column;
            for (var i = 0; i < list.length; i++) {
              item = list[i];

              //Table
              table = item == null ? null : (App.database != 'SQLSERVER' ? item.Table : item.SysTable);
              if (table == null) {
                continue;
              }
              if (DEBUG) {
                log('getDoc [] for i=' + i + ': table = \n' + format(JSON.stringify(table)));
              }

              var table_comment = App.database == 'POSTGRESQL'
                ? (item.PgClass || {}).table_comment
                : (App.database == 'SQLSERVER'
                    ? (item.ExtendedProperty || {}).table_comment
                    : table.table_comment
                );
              // item.Table.table_name = table.table_name
              // item.Table.table_comment = table_comment

              doc += '### ' + (i + 1) + '. ' + CodeUtil.getModelName(table.table_name) + '\n#### Description: \n'
                + App.toMD(table_comment);


              //Column[]
              doc += '\n\n#### Column: \n Name  |  Type  |  Max length  |  Detailed description' +
                ' \n --------  |  ------------  |  ------------  |  ------------ ';

              columnList = item['[]'];
              if (columnList == null) {
                continue;
              }
              if (DEBUG) {
                log('getDoc [] for ' + i + ': columnList = \n' + format(JSON.stringify(columnList)));
              }

              var name;
              var type;
              var length;
              for (var j = 0; j < columnList.length; j++) {
                column = (columnList[j] || {}).Column;
                name = column == null ? null : column.column_name;
                if (name == null) {
                  continue;
                }

                column.column_type = CodeUtil.getColumnType(column, App.database);
                type = CodeUtil.getJavaType(column.column_type, false);
                length = CodeUtil.getMaxLength(column.column_type);

                if (DEBUG) {
                  log('getDoc [] for j=' + j + ': column = \n' + format(JSON.stringify(column)));
                }

                var o = App.database == 'POSTGRESQL'
                  ? (columnList[j] || {}).PgAttribute
                  : (App.database == 'SQLSERVER'
                      ? (columnList[j] || {}).ExtendedProperty
                      : column
                  );
                var column_comment = (o || {}).column_comment

                // column.column_comment = column_comment
                doc += '\n' + name + '  |  ' + type + '  |  ' + length + '  |  ' + App.toMD(column_comment);

              }

              doc += '\n\n\n';

            }

          }

          //[] >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



          //Access[] <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
          list = docObj == null ? null : docObj['Access[]'];
          if (list != null) {
            if (DEBUG) {
              log('getDoc  Access[] = \n' + format(JSON.stringify(list)));
            }

            doc += '\n\n\n\n\n\n\n\n\n### Access\nread Access table to generate\n'
              + ' \n Table  |  Allowed roles for get  |  Allowed roles for head  |  Allowed roles for gets  |  Allowed roles for heads  |  Allowed roles for post  |  Allowed roles for put  |  Allowed roles for delete  |  Table'
              + ' \n --------  |  ---------  |  ---------  |  ---------  |  ---------  |  ---------  |  ---------  |  --------- | --------  ';

            for (var i = 0; i < list.length; i++) {
              item = list[i];
              if (item == null) {
                continue;
              }
              if (DEBUG) {
                log('getDoc Access[] for i=' + i + ': item = \n' + format(JSON.stringify(item)));
              }

              doc += '\n' + (item.name) //右上角设置指定了 Schema  + '(' + item.schema + ')')
                + '  |  ' + JSONResponse.getShowString(JSON.parse(item.get), 2)
                + '  |  ' + JSONResponse.getShowString(JSON.parse(item.head), 2)
                + '  |  ' + JSONResponse.getShowString(JSON.parse(item.gets), 2)
                + '  |  ' + JSONResponse.getShowString(JSON.parse(item.heads), 2)
                + '  |  ' + JSONResponse.getShowString(JSON.parse(item.post), 1)
                + '  |  ' + JSONResponse.getShowString(JSON.parse(item.put), 1)
                + '  |  ' + JSONResponse.getShowString(JSON.parse(item.delete), 1)
                + '  |  ' + (item.name); //右上角设置指定了 Schema  + '(' + item.schema + ')');
            }

            doc += ' \n Table  |  Allowed roles for get  |  Allowed roles for head  |  Allowed roles for gets  |  Allowed roles for heads  |  Allowed roles for post  |  Allowed roles for put  |  Allowed roles for delete  |  Table'

            doc += '\n' //避免没数据时表格显示没有网格
          }

          //Access[] >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


          //Function[] <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
          list = docObj == null ? null : docObj['Function[]'];
          if (list != null) {
            if (DEBUG) {
              log('getDoc  Function[] = \n' + format(JSON.stringify(list)));
            }

            doc += '\n\n\n\n\n\n\n\n\n### Function\nread Function table to generate\n'
              + ' \n Explain  |  Example'
              + ' \n --------  |  -------------- ';

            for (var i = 0; i < list.length; i++) {
              item = list[i];
              if (item == null) {
                continue;
              }
              if (DEBUG) {
                log('getDoc Function[] for i=' + i + ': item = \n' + format(JSON.stringify(item)));
              }

              doc += '\n' + item.detail + '  |  ' + JSON.stringify(item.demo);
            }

            doc += '\n' //避免没数据时表格显示没有网格
          }

          //Function[] >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


          //Request[] <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
          list = docObj == null ? null : docObj['Request[]'];
          if (list != null) {
            if (DEBUG) {
              log('getDoc  Request[] = \n' + format(JSON.stringify(list)));
            }

            doc += '\n\n\n\n\n\n\n\n\n### Request rules\nread Request table to generate\n'
              + ' \n Version  |  Method  |  Data and structure'
              + ' \n --------  |  ------------  |  ------------  |  ------------ ';

            for (var i = 0; i < list.length; i++) {
              item = list[i];
              if (item == null) {
                continue;
              }
              if (DEBUG) {
                log('getDoc Request[] for i=' + i + ': item = \n' + format(JSON.stringify(item)));
              }

              doc += '\n' + item.version + '  |  ' + item.method
                + '  |  ' + JSON.stringify(App.getStructure(item.structure, item.tag));
            }

            doc += '\nNote: \n1.No limit for GET,HEAD.\n2.Use version to specify request rules, use latest version if verion == null || version <= 0。\n\n\n\n\n\n\n';
          }


          //Request[] >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

          App.onChange(false);


          callback(doc);

//      log('getDoc  callback(doc); = \n' + doc);
        });

      },

      toDoubleJSON: function (json, defaultValue) {
        if (StringUtil.isEmpty(json)) {
          return defaultValue == null ? '{}' : JSON.stringify(defaultValue)
        }
        else if (json.indexOf("'") >= 0) {
          json = json.replace(/'/g, '"');
        }
        return json;
      },

      /**转为Markdown格式
       * @param s
       * @return {*}
       */
      toMD: function (s) {
        if (s == null) {
          s = '';
        }
        else {
          //无效
          s = s.replace(/\|/g, '\|');
          s = s.replace(/\n/g, ' <br /> ');
        }

        return s;
      },

      /**处理请求结构
       * @param obj
       * @param tag
       * @return {*}
       */
      getStructure: function (obj, tag) {
        if (obj == null) {
          return null;
        }

        App.log('getStructure  tag = ' + tag + '; obj = \n' + format(JSON.stringify(obj)));

        if (obj instanceof Array) {
          for (var i = 0; i < obj.length; i++) {
            obj[i] = this.getStructure(obj[i]);
          }
        }
        else if (obj instanceof Object) {
          var v;
          var nk;
          for (var k in obj) {
            if (k == null || k == '' || k == 'INSERT' || k == 'REMOVE' || k == 'REPLACE' || k == 'UPDATE') {
              delete obj[k];
              continue;
            }

            v = obj[k];
            if (v == null) {
              delete obj[k];
              continue;
            }

            if (k == 'DISALLOW') {
              nk = '不能传';
            }
            else if (k == 'NECESSARY') {
              nk = '必须传';
            }
            else if (k == 'UNIQUE') {
              nk = '不重复';
            }
            else if (k == 'VERIFY') {
              nk = '满足条件';
            }
            else if (k == 'TYPE') {
              nk = '满足类型';
            }
            else {
              nk = null;
            }

            if (v instanceof Object) {
              v = this.getStructure(v);
            }
            else if (v === '!') {
              v = '非必须传的字段';
            }

            if (nk != null) {
              obj[nk] = v;
              delete obj[k];
            }
          }
        }

        App.log('getStructure  return obj; = \n' + format(JSON.stringify(obj)));

        if (tag != null) {
          //补全省略的Table
          if (this.isTableKey(tag) && obj[tag] == null) {
            App.log('getStructure  isTableKey(tag) && obj[tag] == null >>>>> ');
            var realObj = {};
            realObj[tag] = obj;
            obj = realObj;
            App.log('getStructure  realObj = \n' + JSON.stringify(realObj));
          }
          obj.tag = tag; //补全tag
        }

        return obj;
      },

      /**判断key是否为表名，用CodeUtil里的同名函数会在Safari上报undefined
       * @param key
       * @return
       */
      isTableKey: function (key) {
        App.log('isTableKey  typeof key = ' + (typeof key));
        if (key == null) {
          return false;
        }
        return /^[A-Z][A-Za-z0-9_]*$/.test(key);
      },

      log: function (msg) {
        // console.log('Main.  ' + msg)
      },

      getDoc4TestCase: function () {
        var list = App.remotes || []
        var doc = ''
        var item
        for (var i = 0; i < list.length; i ++) {
          item = list[i] == null ? null : list[i].Document
          if (item == null || item.name == null) {
            continue
          }
          doc += '\n\n#### ' + (item.version > 0 ? 'V' + item.version : 'V*') + ' ' + item.name  + '    ' + item.url
          doc += '\n```json\n' + item.request + '\n```\n'
        }
        return doc
      },

      enableCross: function (enable) {
        this.isCrossEnabled = enable
        this.crossProcess = enable ? 'Cross: On' : 'Cross: Off'
        this.saveCache(App.server, 'isCrossEnabled', enable)
      },

      enableML: function (enable) {
        this.isMLEnabled = enable
        this.testProcess = enable ? 'ML: On' : 'ML: Off'
        this.saveCache(App.server, 'isMLEnabled', enable)
        this.remotes = null
        this.showTestCase(true, false)
      },

      /**随机测试，动态替换键值对
       * @param show
       */
      testRandom: function (show) {
        if (this.isRandomListShow != true) {
          App.testRandomProcess = ''
          this.testRandomWithText(show)
        }
        else {
          var baseUrl = StringUtil.trim(App.getBaseUrl())
          if (baseUrl == '') {
            alert('请先输入有效的URL！')
            return
          }
          //开放测试
          // if (baseUrl.indexOf('/apijson.cn') >= 0 || baseUrl.indexOf('/39.108.143.172') >= 0) {
          //   alert('请把URL改成你自己的！\n例如 http://localhost:8080')
          //   return
          // }
          if (baseUrl.indexOf('/apijson.org') >= 0) {
            alert('请把URL改成 http://apijson.cn:8080 或 你自己的！\n例如 http://localhost:8080')
            return
          }

          const list = App.randoms || []
          var allCount = list.length
          doneCount = 0

          if (allCount <= 0) {
            alert('请先获取随机配置\n点击[查看列表]按钮')
            return
          }
          App.testRandomProcess = '正在测试: ' + 0 + '/' + allCount

          var json = this.getRequest(vInput.value, null, App.type == REQUEST_TYPE_GQL ? StringUtil.get(vGraphQLInput.value) : null) || {}
          var url = this.getUrl()
          var header = this.getHeader(vHeader.value)

          ORDER_MAP = {}  //重置

          for (var i = 0; i < list.length; i ++) {
            const item = list[i]
            const random = item == null ? null : item.Random
            if (random == null || random.name == null) {
              doneCount ++
              continue
            }
            App.log('test  random = ' + JSON.stringify(random, null, '  '))

            const index = i

            const itemAllCount = random.count || 1
            allCount += (itemAllCount - 1)

            var callback = function (url, res, err) {

              doneCount ++
              App.testRandomProcess = doneCount >= allCount ? '' : ('正在测试: ' + doneCount + '/' + allCount)
              try {
                App.onResponse(url, res, err)
                App.log('testRandom  App.testRandomSingle >> res.data = ' + JSON.stringify(res.data, null, '  '))
              } catch (e) {
                App.log('testRandom  App.testRandomSingle >> } catch (e) {\n' + e.message)
              }

              App.compareResponse(allCount, index, item, res.data, true, App.currentAccountIndex, false, err, url)
            }

            try {
              App.testRandomSingle(show, random, App.type, url, json, header, callback)
            } catch (e) {
              App.log('testRandom  App.testRandomSingle >> } catch (e) {\n' + e.message)
              callback(url, {}, e)
            }
          }
        }
      },
      /**随机测试，动态替换键值对
       * @param show
       * @param callback
       */
      testRandomSingle: function (show, random, type, url, json, header, callback) {
        random = random || {}
        var count = random.count || 1
        for (var i = 0; i < count; i ++) {
          var isGQL = type == REQUEST_TYPE_GQL;
          var raw = JSON.parse(JSON.stringify(json));
          var req;
          if (isGQL) {
            req = this.getRandomJSON(JSON.parse(typeof raw.variables == 'string' ? raw.variables : JSON.stringify(raw.variables)), random.config, random.id)
            req = {
              variables: req,
              query: raw.query
            }
          }
          else {
            req = this.getRandomJSON(raw, random.config, random.id)
          }

          if (show == true) {
            vInput.value = JSON.stringify(isGQL ? (req.variables || {}) : req, null, App.indent);
            if (isGQL) {
              vGraphQLInput.value = StringUtil.get(req.query);
            }
            this.send(false, callback);
          }
          else {
            this.request(false, type, url, req, header, callback)
          }
        }
      },
      /**随机测试，动态替换键值对
       * @param show
       * @param callback
       */
      testRandomWithText: function (show, callback) {
        try {
          this.testRandomSingle(show, {id: 0, config: vRandom.value}, this.type, this.getUrl()
            , this.getRequest(vInput.value, null, App.type == REQUEST_TYPE_GQL ? StringUtil.get(vGraphQLInput.value) : null)
            , this.getHeader(vHeader.value), callback)
        }
        catch (e) {
          App.log(e)
          vSend.disabled = true

          App.view = 'error'
          App.error = {
            msg: e.message
          }

          this.isRandomShow = true
          vRandom.select()
        }
      },
      /**随机测试，动态替换键值对
       * @param show
       * @param callback
       */
      getRandomJSON: function (json, config, randomId) {
          var lines = config == null ? null : config.trim().split('\n')
          if (lines == null || lines.length <= 0) {
           return null
          }

          var json = json || {};

          // alert('< json = ' + JSON.stringify(json, null, '  '))

          var line;

          var path; // User/id
          var key; // id
          var value; // RANDOM_DATABASE

          var index;
          var pathKeys;
          var customizeKey;

          for (var i = 0; i < lines.length; i ++) {
            line = lines[i] || '';

            // remove comment
            index = line.indexOf('//');
            if (index >= 0) {
              line = line.substring(0, index).trim();
            }
            if (line.length <= 0) {
              continue;
            }

            // path User/id  key id@
            index = line.lastIndexOf(':'); // indexOf(' : '); 可能会有 Comment:to
            var p_k = line.substring(0, index).trim();
            var bi = p_k.indexOf(' ');
            path = bi < 0 ? p_k : p_k.substring(0, bi);

            pathKeys = path.split('/')
            if (pathKeys == null || pathKeys.length <= 0) {
              throw new Error('随机测试 第 ' + i + ' 行格式错误！字符 ' + path + ' 不符合 JSON 路径的格式 key0/key1/../targetKey !' +
                '\n每个随机变量配置都必须按照 key0/key1/../targetKey replaceKey : value  //注释 的格式！其中 replaceKey 可省略。');
            }

            var lastKeyInPath = pathKeys[pathKeys.length - 1]
            customizeKey = bi > 0;
            key = customizeKey ? p_k.substring(bi + 1) : lastKeyInPath;
            if (key == null || key.trim().length <= 0) {
              throw new Error('随机测试 第 ' + i + ' 行格式错误！字符 ' + key + ' 不是合法的 JSON key!' +
                '\n每个随机变量配置都必须按照 key0/key1/../targetKey replaceKey : value  //注释 的格式！其中 replaceKey 可省略。');
            }

            // value RANDOM_DB
            value = line.substring(index + ':'.length).trim();

            if (value == RANDOM_DB) {
              value = 'randomDb(JSONResponse.getTableName(pathKeys[pathKeys.length - 2]), "' + key + '", 1)';
              if (customizeKey != true) {
                key += '@';
              }
            }
            else if (value == RANDOM_DB_IN) {
              value = 'randomDb(JSONResponse.getTableName(pathKeys[pathKeys.length - 2]), "' + key + '", null)';
              if (customizeKey != true) {
                key += '{}@';
              }
            }
            else if (value == ORDER_DB) {
              value = 'orderDb(' +
                getOrderIndex(
                  randomId
                  , line.substring(0, line.lastIndexOf(' : '))
                  , 0
                ) + ', JSONResponse.getTableName(pathKeys[pathKeys.length - 2]), "' + key + '")';
              if (customizeKey != true) {
                key += '@';
              }
            }
            else {
              var start = value.indexOf('(');
              var end = value.lastIndexOf(')');
              if (start*end <= 0 || start >= end) {
                throw new Error('随机测试 第 ' + i + ' 行格式错误！字符 ' + value + ' 不是合法的随机函数!');
              }

              var fun = value.substring(0, start);
              if (fun == RANDOM_INT) {
                value = 'randomInt' + value.substring(start);
              }
              else if (fun == RANDOM_NUM) {
                value = 'randomNum' + value.substring(start);
              }
              else if (fun == RANDOM_STR) {
                value = 'randomStr' + value.substring(start);
              }
              else if (fun == RANDOM_IN) {
                value = 'randomIn' + value.substring(start);
              }
              else if (fun == ORDER_INT || fun == ORDER_IN) {
                value = (fun == ORDER_INT ? 'orderInt' : 'orderIn') + '(' + getOrderIndex(
                    randomId
                    , line.substring(0, line.lastIndexOf(' : '))
                    , fun == ORDER_INT ? 0 : StringUtil.split(value.substring(start + 1, end)).length
                ) + ',' + value.substring(start + 1);
              }
            }

            //先按照单行简单实现
            //替换 JSON 里的键值对 key: value

            var parent = json;
            var current = null;
            for (var j = 0; j < pathKeys.length - 1; j ++) {
              current = parent[pathKeys[j]]
              if (current == null) {
                current = parent[pathKeys[j]] = {}
              }
              if (parent instanceof Object == false) {
                throw new Error('随机测试 第 ' + i + ' 行格式错误！路径 ' + path + ' 中' +
                  ' pathKeys[' + j + '] = ' + pathKeys[j] + ' 在实际请求 JSON 内对应的值不是对象 {} !');
              }
              parent = current;
            }

            if (current == null) {
              current = json;
            }
            // alert('< current = ' + JSON.stringify(current, null, '  '))

            if (key != lastKeyInPath || current.hasOwnProperty(key) == false) {
              delete current[lastKeyInPath];
            }
            current[key] = eval(value);

            // alert('> current = ' + JSON.stringify(current, null, '  '))
          }

          return json
      },


      /**回归测试
       * 原理：
       1.遍历所有上传过的测试用例（URL+请求JSON）
       2.逐个发送请求
       3.对比同一用例的先后两次请求结果，如果不一致，就在列表中标记对应的用例(× 蓝黄红色下载(点击下载两个文件) √)。
       4.如果这次请求结果正确，就把请求结果保存到和公司开发环境服务器的APIJSON Server，并取消标记

       compare: 新的请求与上次请求的对比结果
       0-相同，无颜色；
       1-对象新增字段或数组新增值，绿色；
       2-值改变，蓝色；
       3-对象缺少字段/整数变小数，黄色；
       4-code/值类型 改变，红色；
       */
      test: function (isRandom, accountIndex) {
        var accounts = this.accounts || []
        // alert('test  accountIndex = ' + accountIndex)
        var isCrossEnabled = this.isCrossEnabled
        if (accountIndex == null) {
          accountIndex = -1 //isCrossEnabled ? -1 : 0
        }
        if (isCrossEnabled) {
          var isCrossDone = accountIndex >= accounts.length
          this.crossProcess = isCrossDone ? (isCrossEnabled ? '交叉账号:已开启' : '交叉账号:已关闭') : ('交叉账号: ' + (accountIndex + 1) + '/' + accounts.length)
          if (isCrossDone) {
            alert('已完成账号交叉测试: 退出登录状态 和 每个账号登录状态')
            return
          }
        }

        var baseUrl = StringUtil.trim(App.getBaseUrl())
        if (baseUrl == '') {
          alert('请先输入有效的URL！')
          return
        }
        //开放测试
        // if (baseUrl.indexOf('/apijson.cn') >= 0 || baseUrl.indexOf('/39.108.143.172') >= 0) {
        //   alert('请把URL改成你自己的！\n例如 http://localhost:8080')
        //   return
        // }
        if (baseUrl.indexOf('/apijson.org') >= 0) {
          alert('请把URL改成 http://apijson.cn:8080 或 你自己的！\n例如 http://localhost:8080')
          return
        }

        const list = App.remotes || []
        const allCount = list.length
        doneCount = 0

        if (allCount <= 0) {
          alert('请先获取测试用例文档\n点击[查看共享]图标按钮')
          return
        }

        if (isCrossEnabled) {
          if (accountIndex < 0 && accounts[this.currentAccountIndex] != null) {  //退出登录已登录的账号
            accounts[this.currentAccountIndex].isLoggedIn = true
          }
          var index = accountIndex < 0 ? this.currentAccountIndex : accountIndex
          this.onClickAccount(index, accounts[index], function (isLoggedIn, index, err) {
            // if (index >= 0 && isLoggedIn == false) {
            //   alert('第 ' + index + ' 个账号登录失败！' + (err == null ? '' : err.message))
            //   App.test(isRandom, accountIndex + 1)
            //   return
            // }
            App.showTestCase(true, false)
            App.startTest(list, allCount, isRandom, accountIndex)
          })
        }
        else {
          App.startTest(list, allCount, isRandom, accountIndex)
        }
      },

      startTest: function (list, allCount, isRandom, accountIndex) {
        this.testProcess = '正在测试: ' + 0 + '/' + allCount

        var baseUrl = App.getBaseUrl()
        for (var i = 0; i < allCount; i ++) {
          const item = list[i]
          const document = item == null ? null : item.Document
          if (document == null || document.name == null) {
            doneCount++
            continue
          }
          if (document.url == '/login' || document.url == '/logout') { //login会导致登录用户改变为默认的但UI上还显示原来的，单独测试OWNER权限时能通过很困惑
            App.log('test  document.url == "/login" || document.url == "/logout" >> continue')
            doneCount++
            continue
          }
          App.log('test  document = ' + JSON.stringify(document, null, '  '))

          const index = i

          var header = null
          try {
            header = App.getHeader(document.header)
          } catch (e) {
            App.log('test  for ' + i + ' >> try { header = App.getHeader(document.header) } catch (e) { \n' + e.message)
          }

          var req
          if (document.type == REQUEST_TYPE_GQL) {
            req = document.request == null ? null : JSON.parse(document.request)
            req = {
              "variables": App.getRequest(req.variables),
              "query": req.query
            }
          }
          else {
            req = App.getRequest(document.request)
          }

          App.request(false, document.type, baseUrl + document.url, req, header, function (url, res, err) {

            try {
              App.onResponse(url, res, err)
              App.log('test  App.request >> res.data = ' + JSON.stringify(res.data, null, '  '))
            } catch (e) {
              App.log('test  App.request >> } catch (e) {\n' + e.message)
            }

            App.compareResponse(allCount, index, item, res.data, isRandom, accountIndex, false, err, url)
          })
        }
      },

      compareResponse: function (allCount, index, item, response, isRandom, accountIndex, justRecoverTest, err, url) {
        var it = item || {} //请求异步
        var d = (isRandom ? App.currentRemoteItem.Document : it.Document) || {} //请求异步
        var r = isRandom ? it.Random : null//请求异步
        var tr = it.TestRecord || {} //请求异步

        if (err != null) {
          tr.compare = {
            code: JSONResponse.COMPARE_ERROR, //请求出错
            msg: '请求出错！',
            path: err.message + '\n\n'
          }
        }
        else {
          var standardKey = App.isMLEnabled != true ? 'response' : 'standard'
          var standard = StringUtil.isEmpty(tr[standardKey], true) ? null : JSON.parse(tr[standardKey])
          tr.compare = JSONResponse.compareResponse(standard, App.removeDebugInfo(response), '', App.isMLEnabled, App.isAPIJSON(url) ? 'code' : 'status', App.isGraphQL(url)) || {}
        }

        App.onTestResponse(allCount, index, it, d, r, tr, response, tr.compare || {}, isRandom, accountIndex, justRecoverTest);
      },

      onTestResponse: function(allCount, index, it, d, r, tr, response, cmp, isRandom, accountIndex, justRecoverTest) {
        tr.compare = cmp;

        it.compareType = tr.compare.code;
        it.hintMessage = tr.compare.path + '  ' + tr.compare.msg;
        switch (it.compareType) {
          case JSONResponse.COMPARE_ERROR:
            it.compareColor = 'red'
            it.compareMessage = '请求出错！'
            break;
          case JSONResponse.COMPARE_NO_STANDARD:
            it.compareColor = 'white'
            it.compareMessage = '确认正确后点击[对的，纠正]'
            break;
          case JSONResponse.COMPARE_KEY_MORE:
            it.compareColor = 'green'
            it.compareMessage = '新增字段/新增值'
            break;
          case JSONResponse.COMPARE_VALUE_CHANGE:
            it.compareColor = 'blue'
            it.compareMessage = '值改变'
            break;
          case JSONResponse.COMPARE_KEY_LESS:
            it.compareColor = 'yellow'
            it.compareMessage = '缺少字段/整数变小数'
            break;
          case JSONResponse.COMPARE_TYPE_CHANGE:
            it.compareColor = 'red'
            it.compareMessage = 'code/值类型 改变'
            break;
          default:
            it.compareColor = 'white'
            it.compareMessage = '查看结果'
            break;
        }
        if (isRandom) {
          it.Random = r
        }
        else {
          it.Document = d
        }
        it.TestRecord = tr

        Vue.set(isRandom ? App.randoms : App.remotes, index, it)

        if (justRecoverTest) {
          return
        }

        doneCount ++
        this.testProcess = doneCount >= allCount ? (App.isMLEnabled ? '机器学习:已开启' : '机器学习:已关闭') : '正在测试: ' + doneCount + '/' + allCount

        this.log('doneCount = ' + doneCount + '; d.name = ' + (isRandom ? r.name : d.name) + '; tr.compareType = ' + tr.compareType)

        var documentId = isRandom ? r.documentId : d.id
        if (this.tests == null) {
          this.tests = {}
        }
        if (this.tests[String(accountIndex)] == null) {
          this.tests[String(accountIndex)] = {}
        }

        var tests = this.tests[String(accountIndex)] || {}
        var t = tests[documentId]
        if (t == null) {
          t = tests[documentId] = {}
        }
        t[isRandom ? r.id : 0] = response

        this.tests[String(accountIndex)] = tests
        this.log('tests = ' + JSON.stringify(tests, null, '    '))
        // this.showTestCase(true)

        if (doneCount >= allCount && App.isCrossEnabled && isRandom != true) {
          // alert('onTestResponse  accountIndex = ' + accountIndex)
          //TODO 自动给非 红色 报错的接口跑随机测试

          this.test(false, accountIndex + 1)
        }
      },

      /**移除调试字段
       * @param obj
       */
      removeDebugInfo: function (obj) {
        if (obj != null) {
          delete obj["sql:generate|cache|execute|maxExecute"]
          delete obj["depth:count|max"]
          delete obj["time:start|duration|end"]

          if (this.isGraphQL()) {
            delete obj.extensions
            delete obj.extensions
          }
        }
        return obj
      },

      /**
       * @param index
       * @param item
       */
      downloadTest: function (index, item, isRandom) {
        item = item || {}
        var document;
        if (isRandom) {
          document = App.currentRemoteItem || {}
        }
        else {
          document = item.Document = item.Document || {}
        }
        var random = isRandom ? item.Random : null
        var testRecord = item.TestRecord = item.TestRecord || {}

        saveTextAs(
          '# APIJSON自动化回归测试-前\n主页: https://github.com/APIJSON/APIJSON'
          + '\n\n接口名称: \n' + (document.version > 0 ? 'V' + document.version : 'V*') + ' ' + document.name
          + '\n返回结果: \n' + JSON.stringify(JSON.parse(testRecord.response || '{}'), null, '  ')
          , '测试：' + document.name + '-前.txt'
        )

        /**
         * 浏览器不允许连续下载，saveTextAs也没有回调。
         * 在第一个文本里加上第二个文本的信息？
         * beyond compare会把第一个文件的后面一段与第二个文件匹配，
         * 导致必须先删除第一个文件内的后面与第二个文件重复的一段，再重新对比。
         */
        setTimeout(function () {
          var tests = App.tests[String(App.currentAccountIndex)] || {}
          saveTextAs(
            '# APIJSON自动化回归测试-后\n主页: https://github.com/APIJSON/APIJSON'
            + '\n\n接口名称: \n' + (document.version > 0 ? 'V' + document.version : 'V*') + ' ' + document.name
            + '\n返回结果: \n' + JSON.stringify(tests[document.id][isRandom ? random.id : 0] || {}, null, '  ')
            , '测试：' + document.name + '-后.txt'
          )


          if (StringUtil.isEmpty(testRecord.standard, true) == false) {
            setTimeout(function () {
              saveTextAs(
                '# APIJSON自动化回归测试-标准\n主页: https://github.com/APIJSON/APIJSON'
                + '\n\n接口名称: \n' + (document.version > 0 ? 'V' + document.version : 'V*') + ' ' + document.name
                + '\n测试结果: \n' + JSON.stringify(testRecord.compare || '{}', null, '  ')
                + '\n测试标准: \n' + JSON.stringify(JSON.parse(testRecord.standard || '{}'), null, '  ')
                , '测试：' + document.name + '-标准.txt'
              )
            }, 5000)
          }

        }, 5000)

      },

      /**
       * @param index
       * @param item
       */
      handleTest: function (right, index, item, isRandom) {
        item = item || {}
        var document;
        if (isRandom) {
          document = App.currentRemoteItem || {}
        }
        else {
          document = item.Document = item.Document || {}
        }
        var random = item.Random = item.Random || {}
        var testRecord = item.TestRecord = item.TestRecord || {}

        var tests = App.tests[String(App.currentAccountIndex)] || {}
        var currentResponse = (tests[isRandom ? random.documentId : document.id] || {})[isRandom ? random.id : 0]

        var isBefore = item.showType == 'before'
        if (right != true) {
          item.showType = isBefore ? 'after' : 'before'
          Vue.set(isRandom ? App.randoms : App.remotes, index, item);

          var compare = testRecord.compare || {}
          var err = isBefore && compare.code == JSONResponse.COMPARE_ERROR ? new Error(compare.path) : null
          var data = isBefore ? currentResponse : (compare.code == JSONResponse.COMPARE_NO_STANDARD ? null : JSON.parse(testRecord.response))
          App.onResponse(document.url, { data: data }, err)  // App.view = 'code'; App.jsoncon = res || ''
        }
        else {
          const isML = App.isMLEnabled
          var url
          var req

          if (isBefore) { //撤回原来错误提交的校验标准
            url = App.server + '/delete'
            req = {
              TestRecord: {
                id: testRecord.id, //TODO 权限问题？ item.userId,
              },
              tag: 'TestRecord'
            }

            App.request(true, REQUEST_TYPE_JSON, url, req, {}, function (url, res, err) {
              App.onResponse(url, res, err)

              var data = res.data || {}
              if (data.code != 200) {
                alert('撤回最新的校验标准 异常：\n' + data.msg)
                return
              }

              App.updateTestRecord(0, index, item, currentResponse, isRandom, App.currentAccountIndex, true)
            })
          }
          else { //上传新的校验标准
            if (currentResponse == null) {
              alert('请先获取正确的结果！ currentResponse == null ! ')
              return
            }

            var standard = StringUtil.isEmpty(testRecord.standard, true) ? null : JSON.parse(testRecord.standard);

            var isGraphQL = App.isGraphQL()
            var codeName = isGraphQL ? "errors" : 'code'
            var code = currentResponse[codeName];
            delete currentResponse[codeName]; //code必须一致，下面没用到，所以不用还原

            var stddObj = App.isMLEnabled ? JSONResponse.updateStandard(standard || {}, App.removeDebugInfo(currentResponse)) : {};
            stddObj[codeName] = code;
            currentResponse[codeName] = code;


              url = App.server + '/post'
              req = {
                TestRecord: {
                  userId: App.User.id, //TODO 权限问题？ item.userId,
                testAccountId: App.getCurrentAccountId(),
                  documentId: isRandom ? random.documentId : document.id,
                  randomId: isRandom ? random.id : null,
                  host: App.getBaseUrl(),
                  compare: JSON.stringify(testRecord.compare || {}),
                  response: JSON.stringify(currentResponse || {}),
                  standard: isML ? JSON.stringify(stddObj) : null
                },
                tag: 'TestRecord'
              }


            App.request(true, REQUEST_TYPE_JSON, url, req, {}, function (url, res, err) {
              App.onResponse(url, res, err)

              var data = res.data || {}
              if (data.code != 200) {
                if (isML) {
                  alert('机器学习更新标准 异常：\n' + data.msg)
                }
              }
              else {
                item.compareType = 0
                item.compareMessage = '查看结果'
                item.compareColor = 'white'
                item.hintMessage = '结果正确'
                testRecord.compare = {
                  code: 0,
                  msg: '结果正确'
                }
                testRecord.response = JSON.stringify(currentResponse)

                // testRecord.standard = stdd
                if (isRandom) {
                  App.showRandomList(true, App.currentRemoteItem)
                }
                else {
                  App.showTestCase(true, false)
                }

                App.updateTestRecord(0, index, item, currentResponse, isRandom)
              }

            })

          }
        }
      },

      updateTestRecord: function (allCount, index, item, response, isRandom) {
        item = item || {}
        var doc = (isRandom ? item.Random : item.Document) || {}

        App.request(true, REQUEST_TYPE_JSON, App.server + '/get', {
          TestRecord: {
            documentId: isRandom ? doc.documentId : doc.id,
            randomId: isRandom ? doc.id : null,
            testAccountId: App.getCurrentAccountId(),
            'host': App.getBaseUrl(),
            '@order': 'date-',
            '@column': 'id,userId,documentId,randomId,response' + (App.isMLEnabled ? ',standard' : ''),
            '@having': App.isMLEnabled ? 'length(standard)>2' : null  // '@having': App.isMLEnabled ? 'json_length(standard)>0' : null
          }
        }, {}, function (url, res, err) {
          App.onResponse(url, res, err)

          var data = (res || {}).data || {}
          if (data.code != 200) {
            alert('获取最新的校验标准 异常：\n' + data.msg)
            return
          }

          item.TestRecord = data.TestRecord
          App.compareResponse(allCount, index, item, response, isRandom, App.currentAccountIndex, true, null);
        })
      },

      //显示详细信息, :data-hint :data, :hint 都报错，只能这样
      setRequestHint(index, item, isRandom) {
        var d = item == null ? null : (isRandom ? item.Random : item.Document);
        var r = d == null ? null : (isRandom ? d.config : d.request);
        if (isRandom) {
          this.$refs['randomTexts'][index].setAttribute('data-hint', r == null ? '' : r);
        }
        else {
          var isGQL = d.type == REQUEST_TYPE_GQL
          this.$refs['testCaseTexts'][index].setAttribute('data-hint', isGQL ? this.getRequest(r).query : JSON.stringify(this.getRequest(r), null, ' '));
        }
      },
      //显示详细信息, :data-hint :data, :hint 都报错，只能这样
      setTestHint(index, item, isRandom) {
        var h = item == null ? null : item.hintMessage;
        this.$refs[isRandom ? 'testRandomResultButtons' : 'testResultButtons'][index].setAttribute('data-hint', h || '');
      },

// APIJSON >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    },
    // watch: {
    //   jsoncon: function () {
    //     this.showJsonView()
    //   }
    // },
    computed: {
      theme: function () {
        var th = this.themes[this.checkedTheme]
        var result = {}
        var index = 0;
        ['key', 'String', 'Number', 'Boolean', 'Null', 'link-link'].forEach(function(key) {
          result[key] = th[index]
          index++
        })
        return result
      }
    },
    created () {
      try { //可能URL_BASE是const类型，不允许改，这里是初始化，不能出错
        var url = this.getCache('', 'URL_BASE')
        if (StringUtil.isEmpty(url, true) == false) {
          URL_BASE = url
        }
        var database = this.getCache('', 'database')
        if (StringUtil.isEmpty(database, true) == false) {
          this.database = database
        }
        var schema = this.getCache('', 'schema')
        if (StringUtil.isEmpty(schema, true) == false) {
          this.schema = schema
        }
        var language = this.getCache('', 'language')
        if (StringUtil.isEmpty(language, true) == false) {
          this.language = language
        }
        var types = this.getCache('', 'types')
        if (types != null && types.length > 0) {
          this.types = types
        }
        var server = this.getCache('', 'server')
        if (StringUtil.isEmpty(server, true) == false) {
          this.server = server
        }
        var swagger = this.getCache('', 'swagger')
        if (StringUtil.isEmpty(swagger, true) == false) {
          this.swagger = swagger
        }

        this.locals = this.getCache('', 'locals') || []

        this.isDelegateEnabled = this.getCache('', 'isDelegateEnabled') || this.isDelegateEnabled
        this.isHeaderShow = this.getCache('', 'isHeaderShow') || this.isHeaderShow
        this.isRandomShow = this.getCache('', 'isRandomShow') || this.isRandomShow
      } catch (e) {
        console.log('created  try { ' +
          '\nvar url = this.getCache(, url) ...' +
          '\n} catch (e) {\n' + e.message)
      }
      try { //这里是初始化，不能出错
        var accounts = this.getCache(URL_BASE, 'accounts')
        if (accounts != null) {
          this.accounts = accounts
          this.currentAccountIndex = this.getCache(URL_BASE, 'currentAccountIndex')
        }
      } catch (e) {
        console.log('created  try { ' +
          '\nvar accounts = this.getCache(URL_BASE, accounts)' +
          '\n} catch (e) {\n' + e.message)
      }

      try { //可能URL_BASE是const类型，不允许改，这里是初始化，不能出错
        this.User = this.getCache(this.server, 'User') || {}
        this.isCrossEnabled = this.getCache(this.server, 'isCrossEnabled') || this.isCrossEnabled
        this.isMLEnabled = this.getCache(this.server, 'isMLEnabled') || this.isMLEnabled
        this.crossProcess = this.isCrossEnabled ? '交叉账号:已开启' : '交叉账号:已关闭'
        this.testProcess = this.isMLEnabled ? '机器学习:已开启' : '机器学习:已关闭'
        // this.host = this.getBaseUrl()
        this.page = this.getCache(this.server, 'page') || this.page
        this.count = this.getCache(this.server, 'count') || this.count
        this.testCasePage = this.getCache(this.server, 'testCasePage') || this.testCasePage
        this.testCaseCount = this.getCache(this.server, 'testCaseCount') || this.testCaseCount

      } catch (e) {
        console.log('created  try { ' +
          '\nthis.User = this.getCache(this.server, User) || {}' +
          '\n} catch (e) {\n' + e.message)
      }

      setTimeout(function () {
        if (App.type == REQUEST_TYPE_GQL) {
          App.indent = '  '
          App.urlComment = 'Query one to may'
          vInput.value = JSON.stringify({
            "arg": {
              "User": {
                "id": 82001
              },
              "[]": {
                "Comment": {
                  "userId@": "User/id"
                }
              }
            }
          }, null, App.indent)
          vRandom.value = `arg/User/id: RANDOM_INT(82001, 82020)
arg/[]/count: ORDER_IN(5, 10, 's', false, [], {})
arg/[]/page: Math.round(5*Math.random())
arg/@explain: RANDOM_IN(true, false)
  //  arg/[]/Comment/toId: RANDOM_DB()

  // 2 blanks before // for comments; clear to show rules.`
          App.onChange(false)
        }
      }, 500)

      //无效，只能在index里设置 vUrl.value = this.getCache('', 'URL_BASE')
      this.listHistory()
      this.transfer()
    }
  })
})()
