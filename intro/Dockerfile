FROM node:10

WORKDIR /problem
ADD package.json ./
RUN yarn install

ENV password foobaridunnoman
ENV postgres_pass oxgFHNhNDckIkEDw
ADD . ./

CMD ["node", "index.js"]