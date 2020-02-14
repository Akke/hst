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
cd /hst
npm install
```

### Client
```
cd /hst/client
npm install
```

# Configure for security
It's important to limit redis and mongo to only accept requests from the HST web server. It's also important to configure mongodb with a username and a password, redis too.

# Running
For development purposes you can easily run the servers at once in one terminal by executing dev command.
```
npm run dev
```
