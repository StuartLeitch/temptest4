enum LinkMethod {
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  POST = 'POST',
  HEAD = 'HEAD',
  GET = 'GET',
  PUT = 'PUT',
}

export interface PayPalLinkDescription {
  method?: LinkMethod;
  href: string;
  rel: string;
}
