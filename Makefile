GROUP_ID?=$$(if [ $$(id -g) = '20' ]; then echo 1111; else id -g; fi)
USER_ID?=$$(id -u)

TARGET_IMAGE=production
TARGET_TAG=latest

build:
	DOCKER_BUILDKIT=1 docker build \
		--progress=plain \
		--build-arg USER_ID=${USER_ID} \
		--build-arg GROUP_ID=${GROUP_ID} \
		--target ${TARGET_IMAGE} \
		-t ${TARGET_IMAGE}:${TARGET_TAG} .
