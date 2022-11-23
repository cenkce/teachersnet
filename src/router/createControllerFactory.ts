import { PeerRequest } from "./PeerRequest";
import { Observable, OperatorFunction, from } from "rxjs";
import {
  switchMap,
  map,
  mergeMap,
  scan,
} from "rxjs/operators";
import { PeerRouteMethod, PeerRequestHandler } from "./PeerRouterMethod";
import { PeerResponse } from "./PeerResponse";

export function createControllerOperator(request$: Observable<PeerRequest>) {
  // TODO: Move rootpath logic out
  return function Controller(
    rootPath?: string
  ): OperatorFunction<PeerRouteMethod[], PeerResponse> {
    const operator = switchMap<PeerRouteMethod[], Observable<PeerResponse>>((routes) => {
      return request$.pipe(
        mergeMap((request) => {
          let hasNext = true;
          const response: PeerResponse = {ok: true, status: 200, statusText: "", payload: {}};
          const iterator = (function* getRoute(){
            for(let route of routes){
              const match = route.match(request);
              if(match !== false){
                request.payload.params = match.params;
                request.payload.path = match.path;
                hasNext = false;
                yield route.handle(request, response, () => {hasNext = true});
              }
            }
          })();

          return from(iterator).pipe(
            scan(
              (response, current) => {
                if(!hasNext){
                  iterator.return();
                }
                if(!!current &&  typeof current === "object" && current !== null && !Array.isArray(current)){
                  Object.assign(response.payload, current);
                }

                return response;
              },
              response
            )
          );
        })
      );
    });

    return operator;
  };
}


export function Post<TRequest = unknown>(
  path: string,
  handler: PeerRequestHandler<TRequest>
) {
  return map<PeerRouteMethod[], PeerRouteMethod[]>((acc, index) => {
    acc.push(new PeerRouteMethod(path, handler, "POST"));

    return acc;
  });
}

export function Get<TRequest = unknown>(
  path: string,
  handler: PeerRequestHandler<TRequest>
) {
  return map<PeerRouteMethod[], PeerRouteMethod[]>((acc, index) => {
    acc.push(new PeerRouteMethod(path, handler, "GET"));

    return acc;
  });
}

export function Delete<TRequest = unknown>(
  path: string,
  handler: PeerRequestHandler<TRequest>
) {
  return map<PeerRouteMethod[], PeerRouteMethod[]>((acc, index) => {
    acc.push(new PeerRouteMethod(path, handler, "DELETE"));

    return acc;
  });
}

export function Patch<TRequest = unknown>(
  path: string,
  handler: PeerRequestHandler<TRequest>
) {
  return map<PeerRouteMethod[], PeerRouteMethod[]>((acc, index) => {
    acc.push(new PeerRouteMethod(path, handler, "PATCH"));

    return acc;
  });
}
