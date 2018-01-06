#!/bin/bash -e

#
# @description bash script to deploy using S3 & CloudFront
#

rungulp() {
	gulp clean && gulp build
}

uploadtos3() {
	[ $# -lt 1 ] && echo "No bucket specified.\nAborting" && exit 1;
	local bucket=$1
	aws s3 sync dist/ s3://$bucket/ --delete
}

refreshcache() {
	[ $# -lt 1 ] && echo "No distribution specified.\nAborting" && exit 1;
	local distributionid=$1
	aws configure set preview.cloudfront true &&
		aws cloudfront create-invalidation --distribution-id=$distributionid --paths=/*
}

loadenv() {
	[ -r ./.env ] && . .env
}
loadenv && rungulp

case $1 in
	prod*)
		echo "Running in production..."
		echo "Uploading bucket: $S3_BUCKET"
		echo "CloudFront distribution: $DISTRIBUTION_ID"
		echo -n "Do you want to proceed? [y/N] "
		read yn
		case $yn in
			[yY]|[yY]es);;
			*)
				echo "Aborting"; exit 2 ;;
		esac

		uploadtos3 $S3_BUCKET &&
			refreshcache $DISTRIBUTION_ID
		;;
	*)
		echo "Running in development..."
		echo "Uploading bucket: $DEV_S3_BUCKET"

		uploadtos3 $DEV_S3_BUCKET
		;;
esac
