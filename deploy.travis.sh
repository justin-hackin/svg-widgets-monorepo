#! /bin/bash
if [ "$TRAVIS_OS_NAME" == osx ]; then
    # deploy on mac
    yarn release
else
   yarn release --linux AppImage
fi
