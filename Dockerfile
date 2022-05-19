FROM node:14.15-alpine

# Set the working directory.
WORKDIR /app

# Inform Docker that the container is listening on the specified port at runtime.
EXPOSE 8500

COPY ./package.json ./package-lock.json ./
COPY ./server.js ./
RUN npm install

RUN mkdir ./src
COPY ./src ./src

RUN mkdir ./common
COPY ./common ./common

RUN mkdir ./route
COPY ./route ./route

CMD ["node", "./server.js"]
