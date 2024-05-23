#!/bin/bash

# Check if Docker is installed
if ! command -v docker > /dev/null
then
    echo "Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose > /dev/null
then
    echo "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Check if anything is running on port 5000
if sudo lsof -iTCP -sTCP:LISTEN -P -n -t :5000 >/dev/null 
then
    echo "Port 5000 is occupied. Please free up this port and try again."
    exit 1
fi

docker-compose build

# Start the services
docker-compose up -d

# Wait for the database container to start
sleep 10

# Get the name of the database container
database_container_name=$(docker-compose ps | grep database_container | awk '{print $1}')

# Check if the database container name was found
if [ -z "$database_container_name" ]
then
    echo "Database container not found. Please check your Docker Compose configuration and try again."
    exit 1
fi

# Copy the SQL file into the container
docker cp ./localtdlogistics.sql $database_container_name:/localtdlogistics.sql

# Import the data into the container
until docker exec -it $database_container_name mysql -u root -pnew_password -e "SELECT 1" > /dev/null 2>&1; do
    echo "Waiting for database connection..."
    sleep 5
done

docker exec -it $database_container_name bash -c "mysql -u root -pnew_password localtdlogistics < /localtdlogistics.sql"