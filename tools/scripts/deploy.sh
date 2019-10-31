#  aws elasticbeanstalk create-application-version \
#       --application-name Invoicing-graphql-dev --version-label invoicing-graphql-dev
AFFECTED_APPS='invoicing-web'
for APP in $AFFECTED_APPS
do
  echo "Deploy application on environment '${APP}-dev'"
  aws elasticbeanstalk update-environment --environment-name $APP-dev --version-label $APP-dev
done

for LIB in $AFFECTED_LIBS
do
  echo "Deploy library on environment '${LIB}-dev'"
  aws elasticbeanstalk update-environment --environment-name $LIB-dev --version-label $LIB-dev
done
