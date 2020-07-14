# affected_apps=$(yarn run affected:apps -- ${AFFECTED_APPS} --plain 2>&1 | tail -1)

echo $(yarn run affected:apps -- -- ${AFFECTED_APPS} --plain 2>&1 | tail -1 | tr " " "\n");
