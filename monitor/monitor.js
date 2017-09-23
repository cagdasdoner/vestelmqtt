var mqtt = require('mqtt'), url = require('url');
var ps = require('ps-node'), util = require('util');

/* Global Params. */
var connectedToBroker = false;
var brokerPID = -1;
var brokerTotalClients = -1;
var brokerBytesSent = -1;
var brokerBytesRecv = -1;

var mqtt_client = mqtt.connect('mqtt://vestelmqtt.xyz:1883');

//console.log(util.inspect(mqtt_client, false, null));

mqtt_client.on('connect', function() {
    console.log("Connected to MQTT broker.");
    connectedToBroker = true;
    mqtt_client.subscribe('$SYS/broker/bytes/sent');
    mqtt_client.subscribe('$SYS/broker/bytes/received');
    mqtt_client.subscribe('$SYS/broker/clients/total');
    pollBroker();
});

mqtt_client.on('error', function(err) {
    connectedToBroker = false;
    console.log("MQTT Connection error!! " + err);
});

mqtt_client.on('offline', function() {
    connectedToBroker = false;
    console.log("MQTT Client is offline!");
});

mqtt_client.on('message', function(topic, message, packet) {
    //console.log("Incoming-> " + message + " on " + topic);
    if(topic == '$SYS/broker/bytes/sent'){
        brokerBytesSent = message;
    }
    else if(topic == '$SYS/broker/bytes/received'){
        brokerBytesRecv = message;
    }
    else if(topic == '$SYS/broker/clients/total'){
        brokerTotalClients = message;
    }
});

exports.monitorResult = function()
{
    var retval = null;
    if(connectedToBroker == true){
         retval = "System status : UP. <br>Process ID: " + brokerPID + "<br>Bytes Sent: " + brokerBytesSent + "<br>Bytes Recv: " + brokerBytesRecv + "<br>Total Clients: " + brokerTotalClients;
    }
    else{
        retval = "System status : DOWN!";
    }

    return retval;
}

function pollBroker()
{
    ps.lookup({
        command: 'mosquitto',
        psargs: 'aux',
        arguments: '-c,/etc/mosquitto/mosquitto.conf'
        }, function(err, resultList ) {
        if (err) {
            brokerPID = -1;
            throw new Error( err );
        }
        resultList.forEach(function( process ){
            if ( process ){
                //console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
                brokerPID = process.pid;
            }
            else{
                brokerPID = -1;
            }
        });
        if ( !resultList.length ){
            brokerPID = -1;
        }
    });
}
