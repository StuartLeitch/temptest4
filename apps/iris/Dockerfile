FROM amancevice/superset:0.38.0

USER root
RUN pip install flask_oidc
RUN mkdir secrets && chmod -R 777 secrets

USER superset
COPY apps/iris .
COPY apps/iris/assets/logo.png /usr/local/lib/python3.8/site-packages/superset/static/assets/images/superset-logo-horiz.png
COPY apps/iris/assets/favicon.png /usr/local/lib/python3.8/site-packages/superset/static/assets/images/favicon.png
