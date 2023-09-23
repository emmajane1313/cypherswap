import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable,
} from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";
import { getAuthenticationToken } from "./utils";
import { BASE_URL } from "./constants";

const httpLink = new HttpLink({ uri: BASE_URL });

const retryLink = new RetryLink();

let link: any;

link = ApolloLink.from([retryLink, httpLink]);

// auth client
export const authClient = new ApolloClient({
  link: link,
  uri: BASE_URL,
  cache: new InMemoryCache(),
});

// main client
const authLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const res = getAuthenticationToken();
    if (!res?.accessToken) {
      observer.complete();
      return;
    }

    let authToken: string = res.accessToken;
    operation.setContext({
      headers: {
        "x-access-token": `Bearer ${authToken}`,
      },
    });
    forward(operation).subscribe(observer);
  });
});

link = ApolloLink.from([retryLink, authLink.concat(httpLink)]);

export const apolloClient = new ApolloClient({
  link: link,
  uri: BASE_URL,
  cache: new InMemoryCache(),
});
