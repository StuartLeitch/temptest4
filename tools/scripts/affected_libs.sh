affected_libs=$(npm run affected:libs -- ${AFFECTED_APPS} --plain 2>&1 | tail -1)

echo ($(echo $affected_libs | tr " "));
