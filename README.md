<div align="center">
  <h1>
    Nodejs template
  </h1>
</div>

<p align="center">
  
</p>



## Table of Contents
- [Table of Contents](#table-of-contents)
- [Usage](#usage)
  - [Without Docker](#without-docker)
  - [With Docker](#with-docker)
- [Folder Structure](#folder-structure)
- [Others](#others)


## Usage

### Without Docker

- `npm install`

- Create a `.env` file using the following content:

    ```
    # COMMON
    DB_NAME=sns-db

    # SERVICE
    VERSION=1.0.0
    SVC_HOST_PORT=8282

    # MONGO_DB
    MONGO_USERNAME=sns-user
    MONGO_PASSWORD=sns-012345
    MONGO_PORT=27017

    # To expose it in host network as well, please specify a port below. Change it to
    # any other ports, if the port is already in use in host.
    MONGO_HOST_PORT=27018

    # MYSQL
    MYSQL_ROOT_USER=root
    MYSQL_ROOT_PWORD=root12345 # you can remove this if MYSQL_ALLOW_EMPTY_PASSWORD is set in docker-compose
    MYSQL_PORT=3306

    # To expose it in host network as well, please specify a port below. Change it to
    # any other ports, if the port is already in use in host.
    MYSQL_HOST_PORT=3307
    ```

- Make sure if you have your local `mongo` running. Then, this will start the server in port `8282`: `npm start`

- To use `mysql`, make sure you have local mysql running with the above setup in `.env` file. Then in `server/core/connectors/index.js` comment out or remove the `mysql` option from ignore list and add `mongo` instead

### With Docker

- Make sure you have created an `.env` file stated above with same content

- This will run the service at `8282` port with `mongo` connectivity by default:

    `docker-compose build && docker-compose up -d`

- To check logs: `docker-compose logs`

- To shutdown: `docker-compose down`

- To use `mysql` instead, check the `docker-compose` file and follow the instructions given in comments.

## Folder Structure

This is how the `server` dir is structured at this moment:

``` 
.
├── api (all the api resources are here)
│   ├── user
│   │   ├── test
│   │   │   └── controller.test.js
│   │   ├── config.js
│   │   ├── controller.js
│   │   ├── index.js
│   │   └── route.js
│   └── index.js
├── core (all the core functionalities of the service is bundled here)
│   ├── bootstrapper.js
│   ├── commonErrorHandler.js
│   ├── logger.js
│   └── shutdownManager.js
├── testHelpers (test specific helpers, global vars should be here)
│   └── globals.js
├── utils (any utils or common helpers should be here)
│   └── error.js
└── index.js    
```

## Others

- To run tests: `npm run test`

- To check for lint errors: `npm run lint`
