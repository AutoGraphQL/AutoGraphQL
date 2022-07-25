package graphql.examples.springboot;

import apijson.demo.server.Controller;
import apijson.demo.server.DemoParser;
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import graphql.ExecutionInput;
import graphql.GraphQL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import zuo.biao.apijson.JSON;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class GraphQLController extends Controller {

    private final GraphQL graphql;
    private final ObjectMapper objectMapper;

    @Autowired
    public GraphQLController(GraphQL graphql, ObjectMapper objectMapper) {
        this.graphql = graphql;
        this.objectMapper = objectMapper;
    }


    /**
     * @param request
     * @return
     * @see
     * <pre>
     *     {
     *       fetch(arg: "{ 'User':{ 'id': 82001 } }")
     *     }
     * </pre>
     * <pre>
     *     {
     *       fetch(arg: "{ 'User':{ 'id': 82001 }, '[]': { 'Comment': { 'userId@': 'User/id' } } }")
     *     }
     * </pre>
     * <pre>
     *     {
     *       fetch(arg: "{ '[]': { 'count': 10, 'page': 1, 'Comment': { '@column': 'id,userId,content' }, 'User':{ 'id@': '/Comment/userId' } } }")
     *     }
     * </pre>
     * <pre>
     *     {
     *       add(arg: "{ 'Comment': { 'userId': 82001, 'momentId': 15, 'content': 'test adding a comment' }, 'tag': 'Comment' }")
     *     }
     * </pre>
     * <pre>
     *     {
     *       remove(arg: "{ 'Comment': { 'id': 1, '@role': 'UNKNOWN' }, 'tag': 'Comment' }")
     *     }
     * </pre>
     * <pre>
     *     {
     *       edit(arg: "{ 'User': { 'id': 82001, 'tag': 'test edit an user' }, 'tag': 'User' }")
     *     }
     * </pre>
     * <pre>
     *     {
     *       count(arg: "{ 'User': { 'sex': 1 } }")
     *     }
     * </pre>
     */
    @SuppressWarnings("unchecked")
    @RequestMapping(value = "/graphql", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @CrossOrigin
    public Map<String, Object> graphql(@RequestBody String request) {
        JSONObject req = JSON.parseObject(request);
        if (req == null) {
            return DemoParser.newErrorResult(new IllegalArgumentException("请求 JSON 不合法！"));
        }
        return executeGraphqlQuery(req.getString("query"), req.getString("operationName"), req.getJSONObject("variables"));
    }

    private Map<String, Object> executeGraphqlQuery(String query, String operationName, Map<String, Object> variables) {
        ExecutionInput executionInput = ExecutionInput.newExecutionInput()
                .query(query)
                .operationName(operationName)
                .variables(variables)
                .build();
        return this.graphql.execute(executionInput).toSpecification();
    }


}
