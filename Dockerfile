# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=20.10.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /usr/src/app

# Backend setup
COPY ./backend /usr/src/app/backend
WORKDIR /usr/src/app/backend
RUN npm install

# Frontend setup
WORKDIR /usr/src/app
COPY ./frontend /usr/src/app/frontend
WORKDIR /usr/src/app/frontend
RUN npm install --dev
RUN npm run build

# Back to backend because frontend build folder has been moved there
WORKDIR /usr/src/app/backend

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD node index.js
