#!/bin/bash

if ! which jscoverage > /dev/null ; then
    echo "NOTE: You must have node-jscoverage installed:"
    echo "https://github.com/visionmedia/node-jscoverage"
    echo "The jscoverage npm module and original JSCoverage packages will not work"
    echo
    if which brew > /dev/null ; then
        echo "NOTE: you are using homebrew, install it with:"
        echo
        echo "$ brew install scripts/node-jscoverage.rb"
    fi

    exit 1
fi
