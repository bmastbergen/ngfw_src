FROM seb/jessie
MAINTAINER Sebastien Delafond <sdelafond@gmail.com>

RUN echo deb http://10.112.11.105/public/jessie nightly main non-free > /etc/apt/sources.list
RUN apt-get update
RUN apt-get install --yes --force-yes untangle-keyring
RUN apt-get update
RUN apt-get install --yes untangle-development-build

ENV SRC=/opt/untangle/ngfw_src
RUN mkdir -p ${SRC}
VOLUME ${SRC}
