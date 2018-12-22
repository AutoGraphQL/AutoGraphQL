package graphql.examples.springboot;

import apijson.demo.server.DemoParser;
import graphql.schema.DataFetcher;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.stereotype.Component;
import zuo.biao.apijson.RequestMethod;

@Component
public class GraphQLDataFetchers {


    public DataFetcher getHelloWorldDataFetcher() {
        return environment -> "world";
    }

    public DataFetcher getEchoDataFetcher() {
        return environment -> environment.getArgument("toEcho");
    }

    public DataFetcher getAPIJSONDataFetcher(RequestMethod method) {
        return new DataFetcher() {
            @Override
            public Object get(DataFetchingEnvironment environment) {
                return new DemoParser(method).parseResponse((String) environment.getArgument("arg"));
            }
        };
    }


}
