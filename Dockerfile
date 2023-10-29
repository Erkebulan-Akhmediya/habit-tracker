FROM node
COPY . /dest
WORKDIR /dest
RUN npm install
CMD [ "node", "index.js" ]
EXPOSE 6969