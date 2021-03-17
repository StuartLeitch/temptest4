import os
import json
from flask_appbuilder.security.manager import AUTH_OID
from security import OIDCSecurityManager

if os.getenv('OIDC_CLIENT_SECRETS_PATH', '') != '':
  AUTH_TYPE = AUTH_OID
  host = os.getenv('KEYCLOAK_HOST')
  realmKey = os.getenv('KEYCLOAK_REALM_KEY')
  clientId = os.getenv('KEYCLOAK_CLIENT_ID')
  clientSecret = os.getenv('KEYCLOAK_CLIENT_SECRET')
  redirectUrls = os.getenv('KEYCLOAK_REDIRECT_URLS')
  
  secrets = {
    "web": {
      "realm_public_key": realmKey,
      "issuer": host,
      "auth_uri": f'{host}/protocol/openid-connect/auth',
      "client_id": clientId,
      "client_secret": clientSecret,
      "redirect_urls": [redirectUrls],
      "userinfo_uri": f'{host}/protocol/openid-connect/userinfo',
      "token_uri": f'{host}/protocol/openid-connect/token',
      "token_introspection_uri": f'{host}/protocol/openid-connect/token/introspect'
   }
  }

  filePath = os.path.join(os.getenv('OIDC_CLIENT_SECRETS_PATH', os.getcwd()), 'config.json')

  print(secrets)

  # Writing data  
  configjzon = open(filePath, "w+") 
  json.dump(secrets, configjzon)
  configjzon.close()
    
  OIDC_CLIENT_SECRETS = os.path.join(os.getenv('OIDC_CLIENT_SECRETS_PATH', os.getcwd()), 'config.json')
  OIDC_ID_TOKEN_COOKIE_SECURE = False
  OIDC_REQUIRE_VERIFIED_EMAIL = False
  AUTH_USER_REGISTRATION = True
  AUTH_USER_REGISTRATION_ROLE = 'Public'
  CUSTOM_SECURITY_MANAGER = OIDCSecurityManager

LOG_FORMAT = '%(asctime)s:%(levelname)s:%(name)s:%(message)s'
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
SQLLAB_TIMEOUT = int(os.getenv('SQLLAB_TIMEOUT', '120'))
ENABLE_PROXY_FIX = True
ENABLE_ROW_LEVEL_SECURITY = True

# Replace this with SecretsManager or SSM Parameter Store.
# TODO - Move to env
# SECRET_KEY = os.environ['SECRET_KEY']

# Replace this with IAM authentication or SecretsManager
# SQLALCHEMY_CUSTOM_PASSWORD_STORE
# TODO - Move to env
SQLALCHEMY_DATABASE_URI = os.environ['SQLALCHEMY_DATABASE_URI']

# TODO: Configure Celery
if os.getenv('CACHE_TYPE', '') == 'redis':
  CACHE_CONFIG = {
    'CACHE_TYPE': 'redis',
    'CACHE_DEFAULT_TIMEOUT': 60 * 60 * 1, # 1 hour default (in secs)
    'CACHE_KEY_PREFIX': 'superset_results',
    'CACHE_REDIS_URL': os.getenv('CACHE_REDIS_URL'),
  }

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
