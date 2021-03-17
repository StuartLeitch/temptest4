import os
import json
from flask_appbuilder.security.manager import AUTH_OID
from security import OIDCSecurityManager

if os.getenv('OIDC_CLIENT_SECRETS_PATH', '') != '':
  AUTH_TYPE = AUTH_OID
  secrets = {
    "web": {
      "realm_public_key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhIMUjeULMkAAky57vRW2pX7hH7Ib9/vi6q1GvhsFIhFUQQ3tNVv4Hg6xUyUtoAvwKLSL6rSoSPTdPYXGcQpiepLu2qN6r2Lj/bbc92T5JftEyYRLZ/awc/hbotXcild+o22ei46qFFCgxhB+05ANBMkrxRgw6te4j76RY2xLGyQKQNEFHSWKsDB8jE9nvT8SW3+h61H7DDkbX5eiQao9Hl14xVxjKYqYMxkXBhQTUes/hCoFuvNQrlQnFUjzP+8bx022S00mbc51/NpYKH/peH+rH5zQyjlT5H0nuPjsKt3xSOsTKEUaPkU12fIh0fUBbAWI8+IeZI5oNcljKo7m0QIDAQAB",
      "issuer": "https://sso.dev.phenom.pub/auth/realms/Phenom",
      "auth_uri": "https://sso.dev.phenom.pub/auth/realms/Phenom/protocol/openid-connect/auth",
      "client_id": "reporting",
      "client_secret": "48334739-f946-475d-8d11-24d2c78d9739",
      "redirect_urls": ["reporting.qa.phenom.pub"],
      "userinfo_uri": "https://sso.dev.phenom.pub/auth/realms/Phenom/protocol/openid-connect/userinfo",
      "token_uri": "https://sso.dev.phenom.pub/auth/realms/Phenom/protocol/openid-connect/token",
      "token_introspection_uri": "https://sso.dev.phenom.pub/auth/realms/Phenom/protocol/openid-connect/token/introspect"
   }
  }

  # curpath = os.path.abspath(os.curdir)
  # packet_file = "%s/%s/%s/%s.mol2" % ("dir", "dir2", "dir3", "some_file")
  # print("Current path is: %s" % (curpath))
  # print("Trying to open: %s" % (os.path.join(curpath, packet_file)))

  filePath = os.path.join(os.getenv('OIDC_CLIENT_SECRETS_PATH', os.getcwd()), 'config.json')

  print("File path")
  print(filePath)

  with open(filePath, "w+") as configjzon: 
    # Writing data to a file  
    configjzon.writelines(json.dumps(secrets))
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
SECRET_KEY = os.environ['SECRET_KEY']

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
