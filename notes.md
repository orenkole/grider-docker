# Dive into docker

## Installing docker on MacOS

docker.com

get started button => developer tab => download for mac (click)

`docker version` - check version

## Using docker client

`docker run hello-world`

- docker looks at local cache,
- if there is no image, it grabs it from hub and puts it to local cache
- and creates a container out of that image
  <img src="./images/using-docker-client-1.png">

## But Really...What's a Container?

What is operating system
<img src="./images/but_really_1.png">

software interacts with hardware thour _kernel_

_Segments_
<img src="./images/but_really_2.png">

_Namespacing_
<img src="./images/but_really_3.png">

_Container_ - running process (chrome) along with subset of physical resources (hard drive, ...)
<img src="./images/but_really_4.png">

_Image_ - snapshot of file system along with specific startap command
<img src="./images/but_really_5.png">

## How's docker running on your computer?

_Namespaces_ and _Control groups_ are specific to _Linux_, not to _Windwows_ or _MacOS_

When we've installed docker, we've installed Linux vm
All containers will be created inside this vm

# Manipulating containers with the docker client

## Docker run in detail

`docker run <image name>` - creating and running a container from an image

## overriding default commands

`docker run busybox echo hi there`

<img src="./images/overriding_default_commands.png">

<img src="./images/overriding_default_commands_2.png">

`docker run busybox ls` - list folders in container

<img src="./images/overriding_default_commands_3.png">

this _ls_ command has to exist inside _busybox_ fs snapshot. Otherwise we would see an error

## Listing running containers

`docker ps` - list running containers

for example, to get lasting container:
`docker run busybox ping google.com` - ping latency to google services

<img src="./images/listing_running_container_1.png">

`docker container ls`, `docker stop <container id>` - stop container

---

`docker ps --all` - list all containes ever have been created

## Container lifecycle

`docker run <image name>` - creating and running a container from an image

`docker run` = `docker create` + `docker start`

---

`docker create hello-world` - we'll get _id_ of created container
`docker start -a <id>` - start container
`-a` - watch the output from container and print to terminal

## Restarting stopped containers

`docker start -a <id> echo bye there` - if default command is `echo hi there`, we can't replace it with another command - we'll get an error `you cannot start and attach multiple containers at once`

## Removing stopped container

`docker ps --all` - see stopped containers (they take space on computer)

`docker system prune` - remove:

- all stopped containers
- all networks not used by at least one container
- all dangling images
- all build cache

_all build cache_ - images will be fetched out form docker hub
We'll have to download it back to hub if we'll run it

`docker ps --all` - list containers

## Retrieving log outputs

`docker logs <container id>` - get logs from a container

<img src="./images/retrieving_log_outputs_1.png">

## Stopping containers

`docker create busybox ping google.com`
// <id>
`docker start <id>`
// <id>
`docker logs <id>`
// logs
`docker ps`
// list containers

there 2 options to stop container

`docker stop <container id>` - stop primary running process with _SIGTERM_ command and do a cleanup (save smth, etc)
If container doesn't stops in 10 seconds, it will fall back to `docker kill <container_id>`

`docker kill <container id>` - kill running process immidiately (_SIGKILL_ is sent to process)
Use if containers doesn't respond to `docker stop <container id>`

## Multi-command containers

`docker run redis` - run redis server

## Executing Commands in Running Containers

`docker exec -it <container_id> <command>` - execute an additional command in a container

<img src="./images/executing_commands_1.png">

`docker exec -it 3766a42c0b28 redis-cli` - set second running program in a container
127.0.0.1:6379> set myValue 5
OK
127.0.0.1:6379> get myValue
"5"
127.0.0.1:6379>
`-it` - to add text to container

## The Purpose of the `it` Flag

<img src="./images/the_purpopse_of_the_it_flag_1.png">

every process in linux environment has 3 communication channels

- STDIN
- STDOUT
- STDERR

`-it` = `-i -t`
`-i` - attach input in terminal to STDIN channel of the process
`-t` - nicely format text on screen

## Getting a Command Prompt in a Container

`docker exec -it sh` - open shell in context of running container

steps:
`docker ps`
`docker exec -it <container_id> sh`

---

examples of commands:
`cd ~/`
`ls`
`echo hi there`
`redis-cli` (ctrl+d to stop)

## Starting with a shell

`docker run -it busybox sh` - start a new container from busybox image and start shell and attach input

if we want additional commands to be executable:
`docker exec -it <container_id> <command>`

## Container isolation

containers don't share file system space
(touch hi-there - create file)

# Building custom images throught docker server

## Creating docker images

<img src="./images/creating_docker_images_1.png">

<img src="./images/creating_docker_images_2.png">

## Building a dockerfile

redis-image / Dockerfile

```docker
# Use an existing docker image as a base
FROM alpine

# Download and install a dependency
RUN apk add --update redis

# Tell the image what todo whet it starts as a container
CMD ["redis-server"]
```

`docker build .`
take container id

`docker run <container_id>`

## Dockerfile teardown

<img src="./images/dockerfile_teadown_1.png">

`FROM` - image used as a base
`RUN` - command while preparing custom image
`CMD` - what to execute when image is used to instanstiate a new container

## What's a base image

<img src="./image/whats_a_base_image_1.png">

`FROM alpine` - _apline_ includes set of programms usefull for installing and installing programs

`RUN apk add --update redis` - download and install redis.
`apk` is not a docker command (apache package kit). It is a package manager preinstalled on _apline_

## The Build Process in Detail

<img src="./images/the_build_process_in_detail_1.png">

`docker build .` - giving docker file to docker cli

_build_ - generate image from docker file

. - docker context

`FROM alpine` - first docker server looked at local build cache if it has downloaded _aplpine_ image. It didn't find local image, so it than reached to docker hub - public repository of images.

---

except for _FROM_ we have intermediate containers

<img src="./images/the_build_process_in_detail_2.png">

With every additional instruction (RUN and CMD so far):

- we take the image that was generated during previous step and create a new container from it
- execute startup command or make a change in file system in that container
- than make a snapshot of that container and make in image that will be used by next step
- image from last step is the resultant image
  <img src="./images/the_build_process_in_detail_3.png">

## A brief recap

<img src="./images/a_brief_recap_1.png">
<img src="./images/a_brief_recap_2.png">
<img src="./images/a_brief_recap_3.png">

## Rebuilds with cache

In the previous file we'll add `RUN apk add --update gcc`

_Dockerfile_

```docker
# Use an existing docker image as a base
FROM alpine

# Download and install a dependency
RUN apk add --update redis
RUN apk add --update gcc

# Tell the image what todo whet it starts as a container
CMD ["redis-server"]
```

and run `docker build .`

note: we'll get `CACHED`:

```d
 => [internal] load build definition from Dockerfile                                                                                 0.0s
 => => transferring dockerfile: 264B                                                                                                 0.0s
 => [internal] load .dockerignore                                                                                                    0.0s
 => => transferring context: 2B                                                                                                      0.0s
 => [internal] load metadata for docker.io/library/alpine:latest                                                                     1.6s
 => [auth] library/alpine:pull token for registry-1.docker.io                                                                        0.0s
 => [1/3] FROM docker.io/library/alpine@sha256:4edbd2beb5f78b1014028f4fbb99f3237d9561100b6881aabbf5acce2c4f9454                      0.0s
 => CACHED [2/3] RUN apk add --update redis                                                                                          0.0s
 => [3/3] RUN apk add --update gcc                                                                                                  11.7s
 => exporting to image                                                                                                               0.7s
 => => exporting layers                                                                                                              0.7s
 => => writing image sha256:4287e63e5cf88e5f26cbf1a81bfee84442b045606b0b5adde8a8106be368436d
```

this means that image after `step RUN apk add --update redis` was already built, so it can be used from cache

## Tagging an image

`docker build .`
get output

```d
writing image sha256:4287e63e5cf88e5f26cbf1a81bfee84442b045606b0b5adde8a8106be368436d
```

than run
`docker run 4287e63e5cf`

<img src="./images/tagging_an_image_1.png">

convention to name tags:
<img src="./images/tagging_an_image_2.png">

create tagged container :
`docker build -t orenkole/redis:latest .`

now we can run container :
`docker run orenkole/redis`

## Manual Image Generation with Docker Commit

instead of file Dockerfile, we'll use console:
`docker run -it alpine sh`
`# apk add --update redis`

open second terminal and take running container, assign default command and create an image:

```d
docker ps
docker commit -c 'CMD ["redis-server"]' a38362d3aaee
// sha256:739e7e63e67fdad7ed21fe35147e93f05592f96ca3388ef4f701dceca7da6b95
docker run 739e7e63e67
// 1:M 17 Apr 2022 16:14:09.914 * Ready to accept connections
```

`-c` - specify default command

# Making real project with docker

## Project outline

<img src="./images/project_outline_1.png">

Disclaimer: We're going to do a few things slightly wrong!

## Node server setup

create:
_simpleweb / package.json_

```json
{
  "dependencies": {
    "express": "*"
  },
  "scripts": {
    "start": "node index.js"
  }
}
```

_simpleweb / index.js_

```javascript
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Hi there");
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
```

## A few planned errors

<img src="./images/a_few_planned_errors_1.png">
<img src="./images/a_few_planned_errors_2.png">

_simpleweb / Dockerfile_

```docker

# Specify base image

FROM alpine

# Install some dependencies

RUN npm install

# Default command

CMD ["npm", "start"]

```

we'll get an error while build image, because there is no copy of npm available (in alpine)

```d

docker build .
// #5 0.252 /bin/sh: npm: not found

```

## Base image issues

**_alpine_** has no **_npm_**

we have 2 options:

1. find image with npm
2. use alpine to get npm

find image with npm:
https://hub.docker.com/_/node

get **_node:apline_** (stripped down version of _node_ image)

simpleweb / Dockerfile

```docker
# Specify base image
FROM node:alpine

# Install some dependencies
RUN npm install

# Default command
CMD ["npm", "start"]
```

`docker run .` - we get error `npm ERR! Tracker "idealTree" already exists`

## A few missing files

## Copying build files

<img src="./images/copying_build_files_1.png">

`COPY` - move files from local machine to temporary container created during buid process

---

error occured: `npm ERR! Tracker "idealTree" already exists`
https://stackoverflow.com/questions/57534295/npm-err-tracker-idealtree-already-exists-while-creating-the-docker-image-for

```docker
# Specify base image
FROM node:alpine

# Install some dependencies
WORKDIR /Users/badger/Desktop/study/docker-grider/simpleweb
COPY ./ ./
RUN npm install

# Default command
CMD ["npm", "start"]
```

create and run container:

```d
docker build -t orenkole/simpleweb .
docker run orenkole/simpleweb
// Listening on port 8080
```

## Container port mapping

but we can't access :

<img src="./images/copying_build_files_2.png">

By default no traffic into container.
Container has it's own set of ports

<img src="./images/container_post_mapping_1.png">

<img src="./images/container_post_mapping_2.png">

<img src="./images/container_post_mapping_4.png">

`> docker run -p 8080:8080 orenkole/simpleweb`

ports don't have to be indentical

## Specifying a Working Directory

==WORKDIR==
Start a terminal inside container:

```
docker run -it orenkole/simpleweb sh
ls
```

we see that there is already files of image, so we can accidentically ovewrite them with copied files.
We have to specify inner directory for our files

<img src="./images/specifying_a_working_directory_1.png">

```dockerfile
# Specify base image
FROM node:alpine

WORKDIR /usr/app

# Install some dependencies
COPY ./ ./
RUN npm install

# Default command
CMD ["npm", "start"]
```

rebuild image:

```d
// build image
docker build -t orenkole/simpleweb

// run container
docker run -p 8081:8081 orenkole/simpleweb

// see list of running containers
docker ps

// open terminal from container
docker exec -it <container_id> sh
```

<img src="./images/specifying_a_working_directory_2.png">

## Unnecessary rebuilds

we just change in _index.js_

`res.send("Hi there");`
to
`res.send("Bye there");`

This invalidates `COPY` step

and runs:

- copying
- `npm install`
  what is not needed

<img src="./images/unneccessary_rebuilds_1.png">

## Minimizing Cache Busting and Rebuilds

Since `npm i` needs only _package.json_, we'll copy only this file

```docker
# Install some dependencies
COPY ./package.json ./
RUN npm install
COPY ./ ./
```

rebuild image
`docker build -t orenkole/simpleweb .`

## App overview

<img src="./images/app_overview_1.png">

architecture when scaling
<img src="./images/app_overview_2.png">

## App server starter code

<img src="./images/app_server_starter_code_1.png">

## App server starter code

```javascript
const express = require("express");
const redis = require("redis");

const app = express();
const client = redis.createClient();
client.set("visits", 0);

app.get("/", (req, res) => {
  client.get("visits", (err, visits) => {
    res.send("Number of visits is " + visits);
    client.set("visits", parseInt(visits) + 1);
  });
});

app.listen(8082, () => {
  console.log("Listening on port 8082");
});
```

## Assembling docker file

```docker
FROM node:alpine

WORKDIR '/app'

COPY package.json .
RUN npm install
COPY . .

CMD ["npm", "start"]
```

`% docker build -t orenkole/visits:latest .`

## Introducing docker compose

we'll get an error
`docker run orenkole/vists`

```d
Error: connect ECONNREFUSED 127.0.0.1:6379
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1195:16)
Emitted 'error' event on RedisClient instance at:
```

There is no redis server to connect to
We'll start a separate container for redis
`docker run redis`

we need connection between two containers (redis and app containers)

Options to connect containers:

- use docker cli network features
- use ==Docker Compose==

Docker Compose is installed with docker. It's a cli

## Docker compose files

<img src="./images/docker_compose_files_1.png">

There is special syntax for _docker-compose.yml_

<img src="./images/docker_compose_files_2.png">

_docker-copmose.yml_
version of docker-compose:
`version: '3'`

`services` take form of docker containers, they are not docker containers, they are liky type of docker container

This means look for an Dockerfile in current directory and use it to build an image, that will be used for _node-app_ container:

```yml
	node-app:
		build: .
```

Dash (`-`) means array in yml file

_docker-compose.yml_

```yml
version: '3'
services:
	redis-server:
		image: 'redis'
	node-app:
		build: .
		ports:
			- "4002:8082"
```

## Networking with docker-compose

By defining services in one _docker-compose.yml_ file those services will be in one network. They don't have to open any ports between them

_index.js_
specify location of redis serve

```javascript
const client = redis.createClient({
  host: "redis-server",
  port: 6379,
});
```

_express_ will try to reach 'redis-server' host, Redis will the connection request from node app it and will redirect it to container running redis-server
By default port of redis-server is ==6379==
