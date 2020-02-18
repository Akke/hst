# Hero Siege Trade systems
Hero Siege trade (also known as HST) is developed using React, Mongo and Redis to create a seamless user experience with live-streamed content. It's a marketplace fansite for the game Hero Siege, which is a pixel ARPG much like Diablo and PoE, where players can list their items for sale. HST does not automatically fetch from the game's inventory like PoE.trade does, but only acts as a middleman between the seller and the buyer.

# How to set it up
Setting the system up is very straightforward, although depending on the distribution of the server (preferably Ubuntu 18.04), it might require further steps.

## Cloning the repository
```
git clone https://github.com/SomePanns/hst.git
```

## Installing Dependencies
Because we run both the backend server and the client server in the same base project directory, they both have their own package configurations and dependencies, which is why we have to install both of them manually.

### Server
```
cd hst
npm install
```

### Client
```
cd client
npm install
```

# Configure for security
- Set up UFW and allow all necessary ports (e.g. 3000, 5000, 27017, 6379) for the server only.
- Set up a password and user for MongoDB.

# Install and Setup Redis
We're using Redis so cache our Steam API responses, specifically for the `getPlayerSummaries` endpoint. To install redis, enter the following command.
```
apt-get install redis-server
```

Afterwards, we need to make sure redis needs a password to connect. Edit the following file.
```
/etc/redis/redis.conf
```
Find `# requirepass foobared`, uncomment it and change `foobared` to a new, secure password.

## Setup Redis Cronjob
To clear all redis keys once every day, we need to make a new file in our `/home` directory called `cleanredisdaily.sh`, where you will paste the following code.
```
redis-cli KEYS "steam_user*" | xargs redis-cli DEL
```

Then we need to set it up to run as a cronjob.
```
crontab -e
```
Go to the end of the file and add the following.
```
0 0 * * * /home/cleanredisfaily.sh
```
This will ensure Redis is cleansed every midnight.

To enable cronjobs, enter the following command.
```
/etc/init.d/cron start
```

# Running
For development purposes you can easily run the servers at once in one terminal by executing dev command.
```
npm run dev
```
