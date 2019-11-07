import { Axios } from "axios-observable";
import { print, ASTNode } from "graphql";
import { Observable } from "rxjs";

export class GraphqlAdapter {
  private axios;

  constructor(private gqlRoot: string) {
    this.axios = Axios.create({
      baseURL: this.gqlRoot,
      timeout: 10000,
    });
  }

  send(query: ASTNode, variables): Observable<any> {
    return this.axios.axiosInstance.post("", {
      query: print(query),
      variables,
    });
  }
}
