import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.jsx";
import "./index.css";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
  split
} from "@apollo/client";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities"

const wsLink = new GraphQLWsLink(
  createClient({url: "wss://snowtooth.fly.dev"})
);

const splitLink = split(({query}) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const httpLink = new HttpLink({
  uri: "https://snowtooth.fly.dev"
});

const client = new ApolloClient({
  // link: httpLink,
  // link: persistedQueryLink.concat(splitLink);
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Lift: {
        keyFields: ["name"] // adding keys to the data
      }, 
      Hotel: {
        fields: {
          avgCost: {
            read(avgCost) {
              return avgCost * 2; // data transformation used for localization, dates, currency exhanges
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: { // global
      nextFetchPolicy: "cache-first"
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);