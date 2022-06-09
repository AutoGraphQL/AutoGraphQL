package graphql.examples.springboot;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Charsets;
import com.google.common.io.Resources;
import graphql.GraphQL;
import graphql.language.ArrayValue;
import graphql.language.BooleanValue;
import graphql.language.FloatValue;
import graphql.language.IntValue;
import graphql.language.ObjectField;
import graphql.language.ObjectValue;
import graphql.language.StringValue;
import graphql.language.Value;
import graphql.schema.Coercing;
import graphql.schema.GraphQLScalarType;
import graphql.schema.GraphQLSchema;
import graphql.schema.idl.RuntimeWiring;
import graphql.schema.idl.SchemaGenerator;
import graphql.schema.idl.SchemaParser;
import graphql.schema.idl.TypeDefinitionRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import zuo.biao.apijson.RequestMethod;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URL;
import java.util.List;

import static graphql.schema.idl.TypeRuntimeWiring.newTypeWiring;

@Component
public class GraphQLProvider {


  @Autowired
  GraphQLDataFetchers graphQLDataFetchers;

  private GraphQL graphQL;

  @PostConstruct
  public void init() throws IOException {
    URL url = Resources.getResource("schema.graphql");
    String sdl = Resources.toString(url, Charsets.UTF_8);
    GraphQLSchema graphQLSchema = buildSchema(sdl);
    this.graphQL = GraphQL.newGraphQL(graphQLSchema).build();
  }

  private GraphQLSchema buildSchema(String sdl) {
    TypeDefinitionRegistry typeRegistry = new SchemaParser().parse(sdl);
    RuntimeWiring runtimeWiring = buildWiring();
    SchemaGenerator schemaGenerator = new SchemaGenerator();
    return schemaGenerator.makeExecutableSchema(typeRegistry, runtimeWiring);
  }

  private RuntimeWiring buildWiring() {
    return RuntimeWiring.newRuntimeWiring()
      .scalar(ANY)
//      .type(newTypeWiring("Any"))
      .type(newTypeWiring("Query")
        .dataFetcher("hello", graphQLDataFetchers.getHelloWorldDataFetcher())
        .dataFetcher("echo", graphQLDataFetchers.getEchoDataFetcher())
        .dataFetcher("fetch", graphQLDataFetchers.getAPIJSONDataFetcher(RequestMethod.GET))
        .dataFetcher("count", graphQLDataFetchers.getAPIJSONDataFetcher(RequestMethod.HEAD))
        .build())
      .type(newTypeWiring("Mutation")
        .dataFetcher("add", graphQLDataFetchers.getAPIJSONDataFetcher(RequestMethod.POST))
        .dataFetcher("edit", graphQLDataFetchers.getAPIJSONDataFetcher(RequestMethod.PUT))
        .dataFetcher("remove", graphQLDataFetchers.getAPIJSONDataFetcher(RequestMethod.DELETE))
        .build())
      .build();

  }

  @Bean
  public GraphQL graphQL() {
    return graphQL;
  }

  public static final GraphQLScalarType ANY = new GraphQLScalarType("Any", "A custom scalar that handles emails", new Coercing() {

    @Override
    public Object serialize(Object dataFetcherResult) {
      return dataFetcherResult;
    }

    @Override
    public Object parseValue(Object input) {
      return input;
    }

    @Override
    public Object parseLiteral(Object input) {
      if (input instanceof BooleanValue) {
        return ((BooleanValue) input).isValue();
      }
      if (input instanceof IntValue) {
        return ((IntValue) input).getValue().longValue();
      }
      if (input instanceof FloatValue) {
        return ((FloatValue) input).getValue().doubleValue();
      }
      if (input instanceof StringValue) {
        return ((StringValue) input).getValue();
      }

      if (input instanceof ArrayValue) {
        List<Value> vs = ((ArrayValue) input).getValues();
        int size = vs == null ? 0 : vs.size();
        JSONArray arr = new JSONArray(size);
        if (size > 0) {
          for (Value v : vs) {
            arr.add(parseLiteral(v));
          }
        }
      }

      if (input instanceof ObjectValue) {
        ObjectValue ov = (ObjectValue) input;
        JSONObject obj = new JSONObject(true);

        List<ObjectField> fs = ov.getObjectFields();
        if (fs != null) {
          for (ObjectField f : fs) {
            obj.put(f.getName(), parseLiteral(f.getValue()));
          }
        }

        return obj;
      }

      return input;
    }
  });

}
