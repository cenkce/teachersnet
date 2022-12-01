import { Auth0Provider } from "@auth0/auth0-react";
import { PropsWithChildren } from "react";

export const UserProvider = (
  props: PropsWithChildren<{ domain: string; clientId: string; redirectUri: string }>
) => {
  return (
    <Auth0Provider
      domain={props.domain}
      clientId={props.clientId}
      redirectUri={props.redirectUri}
      useRefreshTokens={true}
      cacheLocation={"localstorage"}
    >
      {props.children}
    </Auth0Provider>
  );
};
