#!/bin/bash

mkQuery () {
	result=$1
	shift 1
	for param in $@
	do
		result="${result}&${param}"
	done
	echo ${result}
}

authorize_url="https://trello.com/1/authorize"
name="name=trel"
expiration="expiration=1day"
response_type="response_type=token"
scope="scope=read"
key="key={Your api key}"

query=`mkQuery ${name} ${expiration} ${response_type} ${scope} ${key}`

echo "${authorize_url}?${query}"
