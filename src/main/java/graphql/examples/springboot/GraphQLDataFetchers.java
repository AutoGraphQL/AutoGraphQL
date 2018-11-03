package graphql.examples.springboot;

import apijson.demo.server.DemoParser;
import graphql.schema.DataFetcher;
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
        return environment -> new DemoParser(method).parse((String) environment.getArgument("arg"));
    }


}
