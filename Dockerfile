
FROM node:15-alpine

# port for the fastify server to listen on
ENV PORT=3000

# set working directory
WORKDIR /app

# add dependencies
COPY package*.json ./

# install dependencies
RUN npm install --silent

# add app
COPY app.js .

# start app
CMD ["node", "app.js"]