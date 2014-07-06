#!/bin/bash

trap "git co master" 0

all=""

for file in *.js; do
  while read line; do
    [ "$line" ] && { [ "$all" ] && all="$all\n$line" || all="$line" ; }
  done < $file
done

git co gh-pages

 # mv all all.js
 # git add all.js
 # echo "commit message: "
 # read message
 # git commit -m message
 # git push

input () {
  read -p "gh-pages$ " next_command
  [ $next_command = "q" ] && exit 0
  [ $next_command = "all" ] && { echo $all > all.js ; input ; }
  [ $next_command = "commit" ] && {
    git add .
    echo "commit message: "
    read message
    git commit -m message
    git push
    input
  }
  [ $next_command = "stash" ] && { git stash ; input ; }
  gvim $next_command
  input
}

input
