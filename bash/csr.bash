#!/bin/bash

usage() {
	cat <<EOF
Usage: $0 <prefix> [subjfile]
	This script creates CSR for SSL certificate in certain directory.

	<prefix> this script creates files based on this prefix. Domain name is commonly used.
	[subjfile] you can set subject to pass as a file
	
	# Direcotry Structure
	<prefix>
	    \\
	     +- <prefix>.csr
	     +- <prefix>.key
EOF
}

if [ $# -lt 1 ]; then
	usage
	exit 1
fi

prefix=$1
subjfile=$2

#
# Conditional redirection technique; set subject file as file discriptor 3, or else use stdin
# Reference: https://stackoverflow.com/a/1987561
#
[ -r "$subjfile" ] && exec 3<$subjfile || exec 3<&0

mkdir -p $prefix
cd $prefix

openssl req \
	-newkey rsa:2048 -nodes -keyout ${prefix}.key \
	-new -out ${prefix}.csr <&3
