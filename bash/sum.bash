#!/bin/bash

#
# @description sum.bash sums all numbers listed in a file
#

exit_with_message() {
	echo $1 1>&2
	exit 1
}

# exit if no file given
file=$1
[ -r $file ] || exit_with_message "file not found: $file"

# exit if `bc` was not found
which bc >/dev/null || exit_with_message 'bc not found'

grep '^[0-9-]\+' $file | paste -sd+ - | bc
