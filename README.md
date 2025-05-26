# Persistence Furthers

This is a Typescript application that will monitor a configurable list of message exchanges and persist all messages that are received in each. The first exchanges will be all messages recieved by the AuDHD LifeCoach core app and the messages emitted by the AuDHD Lifecoach core app upon discovery of a Commitment. 

As an initial interation, this service will simply persist these messages as events in an EventStoreDB instance, with an event type of messageReceivedFrom{ExchangeName}. 

## Features
- recieve messages from a configurable list of exchanges, described in https://github.com/IzzyFuller/AuDHD-LIfeCoach-Infrastructure
- persist these messages in an event store
- extendable to project data into interesting data structures as needed.

---
