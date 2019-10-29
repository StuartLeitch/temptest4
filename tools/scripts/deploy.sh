# for dir in $(ls -d dist/apps/* | sed 's#\/\/##'); do
#   BUILD="$(basename -- $dir)"

#   aws elasticbeanstalk update-environment --environment-name $BUILD-dev --version-label $BUILD-dev
# done

AFFECTED_APPS='invoicing-graphql'

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
