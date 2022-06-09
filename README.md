# AutoGraphQL
Automatically provide CRUD functions for [GraphQL](https://github.com/graphql) without coding. <br />
<br />
It supplies some automatic Schemas, Types and resolvers so that you don't need to write them. <br />
<br />

### Examples

#### 1.Fetch an User
Request:
```graphql
{
  fetch(arg: {
    User: {
      id: 38710
    }
  })
}
```
Response:
```js
{
  "data": {
    "fetch": {
      "User": {
        "id": 38710,
        "sex": 0,
        "name": "TommyLemon",
        "tag": "Android&Java",
        "head": "http://static.oschina.net/uploads/user/1218/2437072_100.jpg?t=1461076033000",
        "contactIdList": [
          82003,
          82005,
          90814
        ],
        "pictureList": [
          "http://static.oschina.net/uploads/user/1218/2437072_100.jpg?t=1461076033000",
          "http://common.cnblogs.com/images/icon_weibo_24.png"
        ],
        "date": "2017-02-01 11:21:50.0"
      },
      "code": 200,
      "msg": "success"
    }
  }
}
```

http://localhost:8080/?query=%7B%0A%20%20fetch(arg%3A%20%7B%0A%20%20%20%20User%3A%20%7B%0A%20%20%20%20%20%20id%3A%2038710%0A%20%20%20%20%7D%0A%20%20%7D)%0A%7D

![image](https://user-images.githubusercontent.com/5738175/172891745-99d9cfe0-c8bd-4ed0-ba3b-9ec34789b537.png)


#### 2.Fetch a List of Users
Request:
```graphql
{
  fetch(arg: "{'[]':{'count':3,'User':{'@column':'id,name'}}}")
}
```
Response:
```js
{
  "data": {
    "fetch": {
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
            "name": "Test Account"
          }
        }
      ],
      "code": 200,
      "msg": "success"
    }
  }
}
```

http://localhost:8080/?query=%7B%0A%20%20fetch(arg%3A%20%22%7B%27%5B%5D%27%3A%7B%27count%27%3A3%2C%27User%27%3A%7B%27%40column%27%3A%27id%2Cname%27%7D%7D%7D%22)%0A%7D

![image](https://user-images.githubusercontent.com/5738175/172891884-d0830c61-8bb5-46d0-a624-321c51835f01.png)


#### 3.Fetch a Moment with it's publisher
Request:
```graphql
{
  fetch(arg: "{'Moment':{},'User':{'id@':'Moment/userId'}}")
}
```
Response:
```js
{
  "data": {
    "fetch": {
      "Moment": {
        "id": 12,
        "userId": 70793,
        "date": "2017-02-08 08:06:11.0",
        "content": "APIJSON,let interfaces and documents go to hell !",
        "praiseUserIdList": [
          70793,
          93793,
          82044
        ],
        "pictureList": [
          "http://static.oschina.net/uploads/img/201604/22172508_eGDi.jpg",
          "http://static.oschina.net/uploads/img/201604/22172507_rrZ5.jpg"
        ]
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
        "pictureList": [
          "http://static.oschina.net/uploads/img/201604/22172508_eGDi.jpg",
          "http://static.oschina.net/uploads/img/201604/22172507_rrZ5.jpg",
          "https://camo.githubusercontent.com/788c0a7e11a"
        ],
        "date": "2017-02-01 11:21:50.0"
      },
      "code": 200,
      "msg": "success"
    }
  }
}
```

http://localhost:8080/?query=%7B%0A%20%20fetch(arg%3A%20%22%7B%27Moment%27%3A%7B%7D%2C%27User%27%3A%7B%27id%40%27%3A%27Moment%2FuserId%27%7D%7D%22)%0A%7D

![image](https://user-images.githubusercontent.com/5738175/172892294-61675705-7d4d-40c6-b5e2-1094cfc1f33c.png)


#### 4.Add a Moment
Request:
```graphql
mutation {
  add(arg: {
    Moment: {
       userId: 38710,
       content: "AutoGraphQL, automatically CRUD for GraphQL without coding."
    },
    tag: "Moment"
  })
}
```
Response:
```js
{
  "data": {
    "add": {
      "Moment": {
        "code": 200,
        "msg": "success",
        "id": 1654792170886,
        "count": 1
      },
      "code": 200,
      "msg": "success"
    }
  }
}
```

http://localhost:8080/?query=mutation%20%7B%0A%20%20add(arg%3A%20%7B%0A%20%20%20%20Moment%3A%20%7B%0A%20%20%20%20%20%20%20userId%3A%2038710%2C%0A%20%20%20%20%20%20%20content%3A%20%22AutoGraphQL%2C%20automatically%20CRUD%20for%20GraphQL%20without%20coding.%22%0A%20%20%20%20%7D%2C%0A%20%20%20%20tag%3A%20%22Moment%22%0A%20%20%7D)%0A%7D

![image](https://user-images.githubusercontent.com/5738175/172897805-8bdafca3-b1b3-4cfd-9fa8-81ed88f792d4.png)


#### 5.Edit a Moment
Request:
```graphql
mutation {
  edit(arg: {
     Moment: {
       id: 235,
       content: "APIJSON,let interfaces and documents go to hell !"
     },
     tag: "Moment"
  })
}
```
Response:
```js
{
  "data": {
    "edit": {
      "Moment": {
        "code": 200,
        "msg": "success",
        "id": 235,
        "count": 1
      },
      "tag": "Moment",
      "code": 200,
      "msg": "success"
    }
  }
}
```

http://localhost:8080/?query=mutation%20%7B%0A%20%20edit(arg%3A%20%7B%0A%20%20%20%20%20Moment%3A%20%7B%0A%20%20%20%20%20%20%20id%3A%20235%2C%0A%20%20%20%20%20%20%20content%3A%20%22APIJSON%2Clet%20interfaces%20and%20documents%20go%20to%20hell%20!%22%0A%20%20%20%20%20%7D%2C%0A%20%20%20%20%20tag%3A%20%22Moment%22%0A%20%20%7D)%0A%7D

![image](https://user-images.githubusercontent.com/5738175/172894655-6fce77c8-e19f-4040-b7c4-16b3b74ef17b.png)


#### 6.Remove a Comment
Request:
```graphql
mutation {
  remove(arg: {
     Comment: {
        id: 120
     },
     tag: "Comment"
  })
}
```
Response:
```js
{
  "data": {
    "remove": {
      "Comment": {
        "code": 200,
        "msg": "success",
        "id": 120,
        "count": 1,
        "childCount": 3
      },
      "code": 200,
      "msg": "success"
    }
  }
}
```

http://localhost:8080/?query=mutation%20%7B%0A%20%20remove(arg%3A%20%7B%0A%20%20%20%20%20Comment%3A%20%7B%0A%20%20%20%20%20%20%20%20id%3A%20120%0A%20%20%20%20%20%7D%2C%0A%20%20%20%20%20tag%3A%20%22Comment%22%0A%20%20%7D)%0A%7D

![image](https://user-images.githubusercontent.com/5738175/172897253-a6796695-c344-4b7e-83af-66726dd65fd3.png)

<br />
 
### Document
https://github.com/graphql-java/graphql-java#documentation <br />
https://github.com/Tencent/APIJSON/blob/master/Document-English.md#2-keyswords-in-url-parameters <br />

### Related
[GraphAuto](https://github.com/AutoGraphQL/GraphAuto) An advanced API management tool for GraphQL APIs with machine learning. <br />
![image](https://user-images.githubusercontent.com/5738175/172935532-aba3c5a4-0828-45f5-83d9-2735657002ce.png)


### Star to support
https://github.com/AutoGraphQL/AutoGraphQL <br />
