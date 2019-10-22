GROUP_ID?=$$(if [ $$(id -g) = '20' ]; then echo 1111; else id -g; fi)
USER_ID?=$$(id -u)

TARGET_IMAGE=txio_prod
TARGET_TAG=latest

init:
	cp ./docker-compose.override.yml.example ./docker-compose.override.yml && \
	npm install && \
	make build-dev

build:
	DOCKER_BUILDKIT=1 docker build \
		--progress=plain \
		--build-arg USER_ID=${USER_ID} \
		--build-arg GROUP_ID=${GROUP_ID} \
		--target ${TARGET_IMAGE} \
		-t ${TARGET_IMAGE}:${TARGET_TAG} .

build-dev:
	make build TARGET_IMAGE=txio_dev

up:
	docker-compose up txio_dev

test:
	docker-compose run --rm txio_ci
