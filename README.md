Spiny
=====

PubSub system using Chord algorithm ( https://github.com/optimizely/chord );



# Install

```
git clone
npm i
```


# Test Run

## Run Server

```
PORT=3000 HTTP_PORT=8000 MQTT_PORT=1883 node index.js
```

## Publish with MQTT

```
node client/mqtt/pub.js
```

## Subscribe with curl

```
curl -X GET http://localhost:8000/sub/v1/aaa?uuid=1
```

## Subscribe with mqtt

```
node client/mqtt/sub.js
```

## Subscribe with http

```
node client/http/sub.js
```