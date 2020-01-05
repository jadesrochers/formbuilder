#!/bin/bash

if [[ ! $# -gt 0 ]]; then 
  printf %"sNo argument passed for commit message; exiting\n"
  exit 1 
else
  printf "Continuing with commit/build push with this message: %s\n" "$1"
fi

npm run test && git add -u && git commit -m "$1" && npm run build && npm version minor && npm publish && git push -u origin master

