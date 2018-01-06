#!/bin/bash

if [ $# -lt 1 ]; then
	echo "Usage: ${0} <repo> [organization]"
	exit 1
fi

readonly ACCOUNT=${2:-"takayukioda"}
readonly REPOSITORY=${1}

mkdir ${ACCOUNT}
cd ${ACCOUNT}

if [ -d ${REPOSITORY} ]; then
	echo "Repository already exists ;)"
	exit 1
fi

git clone git@github.com:${ACCOUNT}/${REPOSITORY}.git \
	&& echo "${ACCOUNT}/${REPOSITORY} is made :)"
