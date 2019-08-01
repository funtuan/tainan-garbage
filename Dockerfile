FROM node:latest

RUN useradd -ms /bin/bash dormnet && echo "dormnet:dormnet" | chpasswd && adduser dormnet sudo
RUN apt-get update && apt-get install -y apt-utils sudo curl
RUN echo "dormnet ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers
ENV TZ=Asia/Taipei
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
USER dormnet
RUN sudo npm install -g supervisor
RUN sudo npm install -g forever
WORKDIR /home/dormnet/src

CMD ["npm", "run", "start"]
