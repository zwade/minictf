FROM node:10

WORKDIR /problem
COPY ./problem/package.json /problem/
RUN yarn install
RUN yarn global add forever
COPY ./problem/ /problem/
ENV flag CTF{more_length_extension_than_pinocchio}

CMD ["sh", "-c", "forever start index.js && sleep 5 && forever logs -f 0"]