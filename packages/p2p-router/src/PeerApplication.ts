import { IPeerClient } from "./IPeerClient";
import { createControllerOperator } from "./createControllerFactory";
import { createListenerDecorator } from "./decorator/createListenerDecorator";
import { PeerRequest } from "./PeerRequest";
import { OperatorFunction, Observable, of, Subject, UnaryFunction, identity } from "rxjs";
import { PeerRouteMethod } from "./PeerRouterMethod";
import { switchMap } from "rxjs/operators";
import { PeerResponse } from "./PeerResponse";

export function pipeFromArray<T, R>(fns: Array<UnaryFunction<T, R>>): UnaryFunction<T, R> {
  if (fns.length === 0) {
    return identity as UnaryFunction<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input: T): R {
    return fns.reduce((prev: any, fn: UnaryFunction<T, R>) => fn(prev), input as any);
  };
}

export type ControllerFactory = (...args: OperatorFunction<PeerRouteMethod[], PeerRouteMethod[]>[]) => Observable<Observable<PeerResponse>>;
/**
 * Event listener test
 * Network'te client state dinle ve ona gore ui guncelle
 * Tum bagli peerlara event emit
 * Response'u client'a gonder
 * 
 * Controller request path match
 * 
 * Returns Controller and EventListener decorators
 *
 * @param client
 * Application();
 * Controller("user").pipe(Post());
 */
export function PeerApplication(client: IPeerClient) {
  const sink = client.sink();
  const controllers$ = new Subject<Observable<PeerResponse>>();
  let controllersSink = controllers$.pipe(switchMap((routes) => {
    return routes;
  }));

  const controllersSinkSubcsrition = controllersSink.subscribe((val) => {})
  const Controller = createControllerOperator(sink.requests$);
  let routes:OperatorFunction<PeerRouteMethod[], PeerRouteMethod[]>[] = [];
  const ControllerFactory = () => {
    const ControllerOperator = Controller();
    return (...args: OperatorFunction<PeerRouteMethod[], PeerRouteMethod[]>[]) => {
      routes = routes.concat(args);
      const routes$ = pipeFromArray(routes)(of([])).pipe(ControllerOperator)
      controllers$.next(routes$);
      return controllers$.asObservable();
    };
  }
  return [{
      sink(){
        return {
          ...sink,
          request$: controllersSink
        }
      },
      emit: (req: PeerRequest) => client.emit(req),
      dispose: () => {
        controllersSinkSubcsrition.unsubscribe();
      },
      connectPeer: (id: string) => client.connectPeer(id),
      createEvent: (payload) => client.createEvent(payload),
      createRequest: (payload) => client.createRequest(payload),
      getConnectionsCount: () => client.getConnectionsCount(),
      disconnectPeer: (id: string) => client.disconnectPeer(id),
    } as IPeerClient,
    // Controller factory
    ControllerFactory,
    createListenerDecorator(sink.events$),
  ] as const;
}
