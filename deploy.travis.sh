#! /bin/bash
if [ "$TRAVIS_OS_NAME" == osx ]; then
    # deploy on mac
    npm run release
else
   npm run release --linux AppImage
fi
