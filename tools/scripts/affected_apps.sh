# affected_apps=$(npm run affected:apps -- ${AFFECTED_APPS} --plain 2>&1 | tail -1)

echo $(npm run affected:apps -- --plain 2>&1 | tail -1 | tr " " "\n");
