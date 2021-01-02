#! /bin/bash
# from https://qvault.io/2019/08/08/automatic-cross-platform-deployments-with-electron-on-a-ci-server-travis/

if [ "$TRAVIS_OS_NAME" == osx ]; then
    # deploy on mac
    npm run release
else
  docker run --rm -e GH_TOKEN -v "${PWD}":/project -v ~/.cache/electron:/root/.cache/electron -v ~/.cache/electron-builder:/root/.cache/electron-builder electronuserland/builder:wine /bin/bash -c "npm i && npm run release --linux AppImage --win"
fi
