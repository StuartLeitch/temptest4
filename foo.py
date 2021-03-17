# "KEYCLOAK_CERTIFICATES": "https://sso.dev.phenom.pub/auth/realms/Phenom/protocol/openid-connect/certs",
# "KEYCLOAK_CLIENTID": "automation-screening",
# "KEYCLOAK_PASSWORD": "HindawiSandbox",
# "KEYCLOAK_REALM": "Phenom",
# "KEYCLOAK_SERVER_URL": "https://sso.dev.phenom.pub/auth",
# "KEYCLOAK_USERNAME": "phenom_sandbox",

# "realm_public_key": "{{.Values.sso.realmKey}}",
# "issuer": "{{.Values.sso.host}}",
# "auth_uri": "{{.Values.sso.host}}/protocol/openid-connect/auth",
# "client_id": "{{.Values.sso.clientId}}",
# "client_secret": "{{.Values.sso.clientSecret}}",
# "redirect_urls": ["{{.Values.ingress.host }}"],
# "userinfo_uri": "{{.Values.sso.host}}/protocol/openid-connect/userinfo",
# "token_uri": "{{.Values.sso.host}}/protocol/openid-connect/token",
# "token_introspection_uri": "{{.Values.sso.host}}/protocol/openid-connect/token/introspect"


OIDC_CLIENT_SECRETS = {
    "web": {
        "realm_public_key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhIMUjeULMkAAky57vRW2pX7hH7Ib9/vi6q1GvhsFIhFUQQ3tNVv4Hg6xUyUtoAvwKLSL6rSoSPTdPYXGcQpiepLu2qN6r2Lj/bbc92T5JftEyYRLZ/awc/hbotXcild+o22ei46qFFCgxhB+05ANBMkrxRgw6te4j76RY2xLGyQKQNEFHSWKsDB8jE9nvT8SW3+h61H7DDkbX5eiQao9Hl14xVxjKYqYMxkXBhQTUes/hCoFuvNQrlQnFUjzP+8bx022S00mbc51/NpYKH/peH+rH5zQyjlT5H0nuPjsKt3xSOsTKEUaPkU12fIh0fUBbAWI8+IeZI5oNcljKo7m0QIDAQAB",
        "issuer": "https://sso.dev.phenom.pub/auth/realms/Phenom",
        "auth_uri": "https://sso.dev.phenom.pub/auth/realms/Phenom/protocol/openid-connect/auth",
        "client_id": "qa-reporting",
        "client_secret": "48334739-f946-475d-8d11-24d2c78d9739",
        "redirect_urls": ["reporting.qa.phenom.pub"],
        "userinfo_uri": "https://sso.dev.phenom.pub/auth/realms/Phenom/protocol/openid-connect/userinfo",
        "token_uri": "https://sso.dev.phenom.pub/auth/realms/Phenom/protocol/openid-connect/token",
        "token_introspection_uri": "https://sso.dev.phenom.pub/auth/realms/Phenom/protocol/openid-connect/token/introspect"
    }
}
print(OIDC_CLIENT_SECRETS);