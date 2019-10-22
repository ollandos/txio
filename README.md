# txio
Hackathon Project October 2019 - Transifex

## Development

### tl;dr

Run ```make init``` to initialize dev environment.

Run ```make up``` to start docker container listening on ```http://localhost:3005```.


### Commands

|Makefile commands      |Description                               |
|:---------------------:|:----------------------------------------:|
|```make build-dev```   |will build the `txio_dev` image.          |
|```make up```          |will start the `txio_dev`container.       |
|```make test```        |will run the tests in a docker container. |


|npm commands           |Description                               |
|:---------------------:|:----------------------------------------:|
|```npm install```      |will install the `node` requirements.     |
|```npm run start-dev```|will run the server locally.              |
|```npm run test```     |will run tests locally.                   |
|```npm run build```    |will compile production files.            |
