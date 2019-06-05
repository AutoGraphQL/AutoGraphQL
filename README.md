# AutoGraphQL
Auto provide CRUD functions for [GraphQL-Java](https://github.com/graphql-java/graphql-java) with [APIJSON](https://github.com/TommyLemon/APIJSON/blob/master/Document-English.md) and code free.

It supplies some automatic Schemas, Types and resolvers so that you don't need to write them.

For example:

#### 1.Fetch an User
Request:
```js
{
  fetch(arg: {
    User: {
      id: 38710
    }
  }) {
    data
  }
}
```
Response:
```js
{
    "data": {
        "User": {
            "id": 38710,
            "sex": 0,
            "name": "TommyLemon",
            "tag": "Android&Java",
            "head": "http://static.oschina.net/uploads/user/1218/2437072_100.jpg?t=1461076033000",
            "date": 1485948110000,
            "pictureList": [
                "http://static.oschina.net/uploads/user/1218/2437072_100.jpg?t=1461076033000",
                "http://common.cnblogs.com/images/icon_weibo_24.png"
            ]
        },
        "code": 200,
        "msg": "success"
    }
}
```


#### 2.Fetch a List of Users
Request:
```js
{
  fetch(arg: {
    "[]":{
      "count":3,
      "User":{
        "@column":"id,name"
      }
    }
  }) {
    data
  }
}
```
Response:
```js
{
    "data": {
        "[]": [
            {
                "User": {
                    "id": 38710,
                    "name": "TommyLemon"
                }
            },
            {
                "User": {
                    "id": 70793,
                    "name": "Strong"
                }
            },
            {
                "User": {
                    "id": 82001,
                    "name": "Android"
                }
            }
        ],
        "code": 200,
        "msg": "success"
    }
}
```



#### 3.Fetch a Moment with it's publisher
Request:
```js
{
  fetch(arg: {
    "Moment":{
    },
    "User":{
      "id@":"Moment/userId"  //User.id = Moment.userId
    }
  }) {
    data
  }
}
```
Response:
```js
{
    "data": {
        "Moment": {
            "id": 12,
            "userId": 70793,
            "date": "2017-02-08 16:06:11.0",
            "content": "1111534034"
        },
        "User": {
            "id": 70793,
            "sex": 0,
            "name": "Strong",
            "tag": "djdj",
            "head": "http://static.oschina.net/uploads/user/585/1170143_50.jpg?t=1390226446000",
            "contactIdList": [
                38710,
                82002
            ],
            "date": "2017-02-01 19:21:50.0"
        },
        "code": 200,
        "msg": "success"
    }
}
```

#### 4.Add a Comment
Request:
```js
mutation {
  add(arg: {
    "Moment":{
       "userId":38710,
       "content":"APIJSON,let interfaces and documents go to hell !"
    },
    "tag":"Moment"
  }) {
    data
  }
}
```
Response:
```js
{
    "data": {
        "Moment": {
            "code": 200,
            "msg": "success",
            "id": 120
        },
        "code": 200,
        "msg": "success"
    }
}
```

#### 5.Edit a Moment
Request:
```js
mutation {
  edit(arg: {
     "Moment":{
       "id":235,
       "content":"APIJSON,let interfaces and documents go to hell !"
     },
     "tag":"Moment"
  }) {
    data
  }
}
```
Response:
```js
{
    "data": {
        "Moment": {
            "code": 200,
            "msg": "success",
            "id": 235
        },
        "code": 200,
        "msg": "success"
    }
}
```


#### 6.Delete a Moment
Request:
```js
mutation {
  delete(arg: {
     "Moment":{
       "id":120
     },
     "tag":"Moment"
  }) {
    data
  }
}
```
Response:
```js
{
    "data": {
        "Moment": {
            "code": 200,
            "msg": "success",
            "id": 120
        },
        "code": 200,
        "msg": "success"
    }
}
```
