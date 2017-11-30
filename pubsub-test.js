var chai = require('chai');
var expect = chai.expect;

function listener1(msg) {
   console.log("listener1: " + msg);
}

function listener2(msg) {
   console.log("listener2: " + msg);
}

describe('PubSubTests', function() {
  it("should subscribe 2 listeners for 2 different topics", function() {
    var pubsub = require('pubsub.js');
    pubsub.subscribe("foo", listener1, 2);
    pubsub.subscribe("bar", listener2, 2);
    pubsub.publish("foo", "hello");
    pubsub.publish("bar", "world");
    expect(pubsub.getTopicHistory().length).to.equal(2);
  });

  it("should not subscribe same listener again", function() {
    var pubsub = require('pubsub.js');
    pubsub.subscribe("foo", listener2, 2);
    pubsub.subscribe("foo", listener2, 2);
    pubsub.publish("foo", "hello");
    pubsub.publish("foo", "hello");
    expect(pubsub.getTopicHistory().length).to.equal(2);
    expect(pubsub.getSubscribers().length).to.equal(1);
  });

  it("should let subscribe to multiple topics", function() {
    var pubsub = require('pubsub.js');
    pubsub.subscribe("foo", listener2, 2);
    pubsub.subscribe("bar", listener2, 2);
    pubsub.subscribe("foo2", listener2, 2);
    pubsub.subscribe("foo3", listener2, 2);
    expect(pubsub.getSubscribers().length).to.equal(1);
    var topics = pubsub.getTopics();
    var expectedTopics = ['foo', 'bar', 'foo2', 'foo3'];
    for(var i = 0; i < topics.length; i++)
        expect(topics[i]).to.equal(expectedTopics[i])
  });

  it("should drain the queue", function() {
    var pubsub = require('pubsub.js');
    pubsub.drain();
    expect(pubsub.getSubscribers().length).to.equal(0);
    expect(pubsub.getTopicHistory().length).to.equal(0);
  });

  it("should not publish when no subscriners", function() {
    var pubsub = require('pubsub.js');
    pubsub.publish("foo", "hello");
    pubsub.publish("bar", "hello");
    expect(pubsub.getSubscribers().length).to.equal(0);
    expect(pubsub.getTopicHistory().length).to.equal(0);
  });

  it("should publish when topicname has regex pattern", function() {
    var pubsub = require('pubsub.js');
    pubsub.subscribe("f*", listener2);
    pubsub.publish("foo", "hello");
    pubsub.publish("fab", "hello");
    expect(pubsub.getSubscribers().length).to.equal(1);
    expect(pubsub.getTopicHistory().length).to.equal(2);
  });

});
