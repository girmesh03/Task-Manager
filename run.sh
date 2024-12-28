#!/bin/bash

# Check if two arguments are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <target> <environment>"
    echo "Target must be 'server', 'client', or 'dev'."
    echo "Environment must be 'production' or 'development'."
    exit 1
fi

TARGET=$1
ENVIRONMENT=$2

# Validate the environment
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "development" ]; then
    echo "Invalid environment. Use 'production' or 'development'."
    exit 1
fi

# Validate the target
if [ "$TARGET" != "server" ] && [ "$TARGET" != "client" ] && [ "$TARGET" != "dev" ]; then
    echo "Invalid target. Use 'server', 'client', or 'dev'."
    exit 1
fi

# Set NODE_ENV based on the argument
export NODE_ENV=$ENVIRONMENT

# Run the appropriate npm command based on the target
npm run "$TARGET"


