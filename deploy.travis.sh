#! /bin/bash
yarn global add cmake-js
if [ "$TRAVIS_OS_NAME" == osx ]; then
    # deploy on mac
    yarn release
else
   yarn release --linux AppImage
fi
