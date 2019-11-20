import { Observable } from "rxjs";
import { Axios } from "axios-observable";
import { print, ASTNode } from "graphql";

export class GraphqlAdapter {
  private axios;

  constructor(private gqlRoot: string) {
    this.axios = Axios.create({
      baseURL: this.gqlRoot,
      timeout: 10000,
    });

    this.axios.interceptors.response.use(function(response) {
      return {
        ...response,
        data: GraphqlAdapter.parseGQLErrors(response.data),
      };
    });
  }

  static parseGQLErrors({ data, errors }) {
    // TODO?: implement a more robust error handling interceptor? KRONOS
    if (!data && errors) {
      throw errors[0];
    }
    return data;
  }

  send(query: ASTNode, variables?: any): Observable<any> {
    return this.axios.axiosInstance.post("", {
      query: print(query),
      variables,
    });
  }
}
