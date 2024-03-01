#!/bin/bash

docker ps

read -p "Enter the ID of the container: " container_Id

current_datetime=$(date +"%Y-%m-%d-%H-%M-%S")

echo "${current_datetime}"

destination_file="${current_datetime}.db"

rm ./backend/baby-formula.db

echo "Copying baby-formula.db file as ${destination_file}"

docker cp "${container_Id}:/usr/src/app/backend/baby-formula.db" "${destination_file}"

echo "Remove lock from file and please hit ENTER"

read -r input

echo "Copy ${destination_file} back to backend folder"

cp ${destination_file} ./backend/baby-formula.db

echo "Stopping docker container with ID: ${container_Id}"

docker stop ${container_Id}

echo "Removing docker container with ID: ${container_Id}"

docker rm ${container_Id}

echo "Running docker compose"

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    docker-compose up --build
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OSX
    docker compose up --build
fi

echo "DONE! enjoy"
