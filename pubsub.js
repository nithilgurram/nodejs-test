
var pubsub = {};
// map for holding topics and their listeners
var topicListenerMap = {};
// map for holding history of topics and messages
var topicMessagesHistoryMap = {};

// This function helps to deliver latest N messages to the listeners
function deliverLastNMessages(topicName, listener, count) {
    var messages = topicMessagesHistoryMap[topicName];
    if(!messages) {
        return;
    }
    for(var i = messages.length - 1, upto = i - count; i > upto; i--) {
        if(messages[i]) {
            listener(messages[i]);
        }
    }
}

// This function helps adds delivered messages to history
function addToHistory(topicName, message) {
    var topicMessageHistory = topicMessagesHistoryMap[topicName];
    if(!topicMessageHistory) {
        topicMessagesHistoryMap[topicName] = topicMessageHistory = [];
    }
    if(topicMessageHistory.indexOf(message) == -1) {
        topicMessageHistory.push(message);
    }
}

// It retrieves all the topics matching a given pattern.
function getAllTopics(topicName) {
    var keys = Object.keys(topicListenerMap);
    var regExp = new RegExp(topicName);
    var matchingTopics = [];
    for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if(regExp.test(key)) {
            matchingTopics.push(key);
        } else
            console.log("Didnot match "+key);
    }
    return matchingTopics;
}

// This method subscribes given listener to the topic and also
// deliverers last few messages (as requested through count) to the subscriber
function subscribeListenerToOneTopic(topicName, listener, count) {
    var topicListeners = topicListenerMap[topicName];
    if(!topicListeners) {
        topicListenerMap[topicName] = topicListeners = [];
    }
    if(topicListeners.indexOf(listener) == -1) {
        topicListeners.push(listener);
        if(count && count > 0) {
            deliverLastNMessages(topicName, listener, count);
        }
    }
}

// Subscribes the listener to all the matching topics.
function subscribeListenerToAllMatchingTopics(topicName, listener, count) {
    var matchingTopics = getAllTopics(topicName);
    // subscribe listener all the matching topics
    for(var matchingTopic in matchingTopics) {
        subscribeListenerToOneTopic(matchingTopic, listener, count);
    }
}

// Utility method to check if the input topic name has some special chars
function checkForRegExpPattern(input) {
    var pattern = new RegExp(/[$^*+?]/);
    return pattern.test(input);
}

module.exports = {

    // Publishes a given message to a given topic
    publish: function(topicName, message) {
        var topicListeners = topicListenerMap[topicName];
        if(!topicListeners) {
            return;
        }
        for(var i = 0; i < topicListeners.length; i++) {
            topicListeners[i](message);
            addToHistory(topicName, message);
        }
    },

    // Subscribes listener to a given topic. Count specifies the last recent messages if any,
    // will be delivered to the subscribers
    subscribe: function(topicName, listener, count) {
        if(checkForRegExpPattern(topicName)) {
            subscribeListenerToAllMatchingTopics(topicName, listener, count);
        } else
            subscribeListenerToOneTopic(topicName, listener, count);
    },

    // For the sake of assertions in unit tests. Not required otherwise
    getTopicHistory: function() {
        return Object.keys(topicMessagesHistoryMap);
    },

    // For the sake of assertions in unit tests. Not required otherwise
    getSubscribers: function() {
        var listeners = [];
        for(var key in topicListenerMap) {
            listeners = topicListenerMap[key];
        }
        return listeners;
    },

    // For the sake of assertions in unit tests. Not required otherwise
    getTopics: function() {
        return Object.keys(topicListenerMap);
    },

    drain: function() {
        topicListenerMap = {};
        topicMessagesHistoryMap = {};
    }

};
