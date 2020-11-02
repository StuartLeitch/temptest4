FROM amancevice/superset:0.37.2

USER root
RUN pip install flask_oidc

USER superset
COPY apps/iris .
COPY apps/iris/assets/logo.png /usr/local/lib/python3.6/site-packages/superset/static/assets/images/superset-logo-horiz.png
COPY apps/iris/assets/favicon.png /usr/local/lib/python3.6/site-packages/superset/static/assets/images/favicon.png
