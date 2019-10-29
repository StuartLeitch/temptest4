for dir in $(ls -d dist/apps/* | sed 's#\/\/##'); do
  BUILD="$(basename -- $dir)"

  aws elasticbeanstalk update-environment --environment-name $BUILD-dev --version-label $BUILD-dev
done
