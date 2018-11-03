/*Copyright ©2016 TommyLemon(https://github.com/TommyLemon/APIJSON)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/

package apijson.demo.server.model;

import static zuo.biao.apijson.RequestRole.ADMIN;
import static zuo.biao.apijson.RequestRole.CIRCLE;
import static zuo.biao.apijson.RequestRole.CONTACT;
import static zuo.biao.apijson.RequestRole.LOGIN;
import static zuo.biao.apijson.RequestRole.OWNER;

import zuo.biao.apijson.MethodAccess;

/**动态
 * @author Lemon
 */
@MethodAccess(
		PUT = {LOGIN, CONTACT, CIRCLE, OWNER, ADMIN}//TODO 还要细分，LOGIN,CONTACT只允许修改praiseUserIdList。数据库加role没用，应该将praiseUserIdList移到Praise表
		)
public class Moment {
}