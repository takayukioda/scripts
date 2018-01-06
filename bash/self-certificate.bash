#!/bin/bash

#
# DO NOT USE other than local environment
#
# @description it creates own certified crt file for local development purpose
#

certname=${1:-server}

openssl genrsa 2048 > ${certname}.key
openssl req -new -key ${certname}.key | openssl x509 -days 3650 -req -signkey ${certname}.key > ${certname}.crt
