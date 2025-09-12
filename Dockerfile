FROM --platform=linux/amd64 node:lts-alpine
WORKDIR /usr/src/
COPY ./src /usr/src/
RUN npm i && npm i -g typescript ts-node
EXPOSE 80
CMD ["/usr/local/bin/npx", "ts-node" ,"index.ts"]
