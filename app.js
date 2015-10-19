/**
 * Created by alexey on 20.09.15.
 */

/**
 * Global vars for view
 */
var LifoAverageInSystemTime, LifoDeviationInSystem, LifoAverageWaitTime, LifoAverageServeTime, LifoFunction, LifoTotalRelevance, LifoComplToAll;
var RandAverageInSystemTime, RandDeviationInSystem, RandAverageWaitTime, RandAverageServeTime, RandFunction, RandTotalRelevance, RandComplToAll;

/**
 *
 * @type {{generatorPuason: Function, generatorRegular: Function}}
 * Class(constructor) for generator;
 */
var Generator = {
    generatorPuason: function (lambda) {
        var t = (-1 / lambda) * Math.log(Math.random());

        return t;

    },
    generatorRegular: function (lambda) {
        var t = 1 / lambda;
        return t;
    }

};
/**
 *
 * @param t1
 * @param t2
 * @constructor
 * Class(constructor) for calculating relevance
 */
function Relevance(t1, t2) {
    this.t1 = t1;
    this.t2 = t2;
    this.getRelevance = function (t) {

        if (t <= this.t1) {
            return 1;
        }
        if (t < this.t2) {
            return (this.t2 - t) / (this.t2 - this.t1);
        }
        return 0;

    }
}
/**
 *
 * @param bornTime
 * @param serveTime
 * @constructor
 * Class(constructor) of Events.
 * Include fields for time calculation.
 *
 */
function Events(bornTime, serveTime) {


    this.bornTime = bornTime;
    this.serveTime = serveTime;

    this.completedTime = -1;

    this.reactTime = 0;

    this.waitTime = 0;
    this.inSystemTime = 0;

    this.revelance = 0;

    this.isCompleted = function () {
        return this.completedTime > 0.0;
    }


}

/**
 *
 * @param n
 * @param lambda
 * @param myu
 * @returns {Array}
 * function for generation array of events
 */
function eventGenerator(n, lambda, myu) {
    var events = [];
    var time = 0;

    for (var i = 0; i < n; i++) {
        time += Generator.generatorPuason(lambda);

        var e = new Events(time, Generator.generatorRegular(myu));
        events.push(e);

    }
    return events;


}
/**
 *
 * @param localEvents
 * @param relevance
 * @param k
 * function which simulates QMS with LIFO Queue
 */
function lifoQMS(localEvents, relevance, k) {
    var events = localEvents;
    var totalReactTime;
    var totalInSystemTime;
    var N = events.length;
    var totalWaitTime;
    var totalServeTime;
    var totalRelevance = 0;
    var deviationInSystem;
    var averageServeTime;
    var averageInSystemTime;
    var averageReactTime;
    var averageWaitTime;
    var completedTasks = 0;


    Lifo(localEvents, relevance);


    function calculateValues(events) {

        totalInSystemTime = totalReactTime = totalServeTime = totalWaitTime = 0.0;

        events.forEach(function (e, i, events) {

            if (e.isCompleted()) {

                totalInSystemTime += e.inSystemTime;

                totalReactTime += e.reactTime;
                totalWaitTime += e.waitTime;
                totalServeTime += e.serveTime;
                totalRelevance += e.relevance;

            }
            averageInSystemTime = totalInSystemTime / N;

            averageReactTime = totalReactTime / N;
            averageWaitTime = totalWaitTime / N;
            averageServeTime = totalServeTime / N;
            deviationInSystem = 0;

            events.forEach(function (e, i, events) {
                deviationInSystem += (averageInSystemTime - e.inSystemTime) * (averageInSystemTime - e.inSystemTime)
            });
            deviationInSystem /= N;


        });

        console.log("Lifo");
        LifoAverageInSystemTime = averageInSystemTime;
        LifoAverageWaitTime = averageWaitTime;
        LifoAverageServeTime = averageServeTime;
        LifoDeviationInSystem = deviationInSystem;
    }

       LifoFunction = calculateFunction();
    function calculateFunction() {
        var result = 0;
        LifoTotalRelevance = totalRelevance;
        LifoComplToAll = completedTasks / N;
        result += k[0] * averageInSystemTime;
        result += k[1] * deviationInSystem;
        result += k[2] * averageReactTime;
        result += k[3] * completedTasks / N;
        result += k[4] * totalRelevance;

        return result;


    }

    function Lifo(events, relevance) {

        var eventQueue = [];
        var time = 0;
        var servedEvents = [];


        while (events.length > 0) {
            var e = events[0];


            var useEventFromQueue = false;

            if (time < e.bornTime) {

                if (eventQueue.length > 0) {

                    e = eventQueue[eventQueue.length - 1];
                    useEventFromQueue = true;


                } else
                    time = e.bornTime;


            }
            else {
                eventQueue.push(events.shift());





                continue;

            }

            e.relevance = relevance.getRelevance(time - e.bornTime);

            if (e.relevance >= 0) {
                var newTime = time + e.serveTime;

                processEvent(e, newTime);
                time = newTime;
            }
            if (useEventFromQueue)
                servedEvents.push(eventQueue.pop());

            else
                servedEvents.push(events.shift());


        }

        while (eventQueue.length > 0) {

            var eQueue = eventQueue.pop();


            eQueue.relevance = relevance.getRelevance(time - eQueue.bornTime);

            if (eQueue.revelance >= 0) {
                servedEvents.push(eQueue);

                var queueNewTime = time + eQueue.serveTime;
                processEvent(eQueue, queueNewTime);
                time = queueNewTime;

            }


        }
        function processEvent(e, time) {
            completedTasks++;

            e.completedTime = time;

            e.lastServeTime = time;


            e.reactTime = (time - e.serveTime - e.bornTime);

            e.waitTime = (time - e.serveTime - e.bornTime);


            e.inSystemTime = (time - e.bornTime);


        }

        calculateValues(servedEvents);
        return servedEvents;
    }

}
/**
 *
 * @param events
 * @param relevance
 * @param k
 *
 * function which simulates QMS with RAND Queue
 */
function randQMS(events, relevance, k) {

    var totalReactTime;
    var totalInSystemTime;
    var N = events.length;
    var totalWaitTime;
    var totalServeTime;
    var totalRelevance = 0;
    var deviationInSystem;
    var averageServeTime;
    var averageInSystemTime;
    var averageReactTime;
    var averageWaitTime;
    var completedTasks = 0;
    var localEvents = events;

    Rand(localEvents, relevance);


    function calculateValues(events) {

        totalInSystemTime = totalReactTime = totalServeTime = totalWaitTime = 0.0;

        events.forEach(function (e, i, events) {

            if (e.isCompleted()) {
                RandTotalRelevance = totalRelevance;
                RandComplToAll = completedTasks / N;
                totalInSystemTime += e.inSystemTime;

                totalReactTime += e.reactTime;
                totalWaitTime += e.waitTime;
                totalServeTime += e.serveTime;
                totalRelevance += e.relevance;

            }
            averageInSystemTime = totalInSystemTime / N;

            averageReactTime = totalReactTime / N;
            averageWaitTime = totalWaitTime / N;
            averageServeTime = totalServeTime / N;
            deviationInSystem = 0;

            events.forEach(function (e, i, events) {
                deviationInSystem += (averageInSystemTime - e.inSystemTime) * (averageInSystemTime - e.inSystemTime)
            });
            deviationInSystem /= N;


        });

        RandAverageInSystemTime = averageInSystemTime;
        RandAverageWaitTime = averageWaitTime;
        RandAverageServeTime = averageServeTime;
        RandDeviationInSystem = deviationInSystem;



    }

    RandFunction = calculateFunction();
    function calculateFunction() {
        var result = 0;

        result += k[0] * averageInSystemTime;
        result += k[1] * deviationInSystem;
        result += k[2] * averageReactTime;
        result += k[3] * completedTasks / N;
        result += k[4] * totalRelevance;

        return result;


    }

    function Rand(events, relevance) {
        var time = 0;
        var useEventQueue;
        var eventQueue = [];
        var servedEvents = [];

        while (events.length > 0) {
            var e = events[0];

            useEventQueue = false;
            if (time < e.bornTime) {
                if (eventQueue.length > 0) {
                    var i = Math.floor(Math.random() * (eventQueue.length));
                    e = eventQueue[i];


                    eventQueue.splice(i, 1);

                    servedEvents.push(e);
                    useEventQueue = true;
                } else {
                    time = e.bornTime;
                }
            } else {
                eventQueue.push(e);

                events.splice(events.indexOf(e), 1);

                continue;

            }

            e.relevance = relevance.getRelevance(time - e.bornTime);

            if (e.relevance >= 0) {

                var newTime = time + e.serveTime;
                processEvent(e, newTime);
                time = newTime;
            }
            if (!useEventQueue) {
                servedEvents.push(events.shift());
            }

        }

        while (eventQueue.length > 0) {

            i = Math.floor(Math.random() * (eventQueue.length));
            var eQueue = eventQueue[i];

            eventQueue.splice(eventQueue.indexOf(eQueue), 1);

            eQueue.relevance = relevance.getRelevance(time - e.bornTime);
            if (eQueue.relevance >= 0) {
                servedEvents.push(eQueue);

                var newTimeQueue = time + e.serveTime;
                processEvent(eQueue, newTimeQueue);
                time = newTimeQueue;
            }


        }
        function processEvent(e, time) {
            completedTasks++;

            e.completedTime = time;

            e.lastServeTime = time;


            e.reactTime = (time - e.serveTime - e.bornTime);

            e.waitTime = (time - e.serveTime - e.bornTime);


            e.inSystemTime = (time - e.bornTime);


        }

        calculateValues(servedEvents);

        return servedEvents;
    }
}
/**
 *
 * @param object
 * @returns {{}}
 *
 * function for copy objects,
 * without linking
 */
function oCopy(object) {
    var nO = {};
    for (var pr in object) {
        nO[pr] = object[pr];
    }
    return nO;
}
/**
 *
 * @param array
 * @returns {Array}
 * function for copy array of objects
 * without linking
 */
function copyArrayOfObject(array) {
    var nA = [];
    for (var i = 0; i < array.length; i++) {
        nA[i] = oCopy(array[i]);
    }
    return nA;
}
/**
 *  main function which receiving
 *  input parameters from view(user).
 *  Binding output with view
 *
 *
 */
function main() {
    /* receiving parameters*/
    var lambda = +document.getElementById("lambda").value;
    var myu = +document.getElementById("myu").value;
    var n = +document.getElementById("n").value;
    var t1 = +document.getElementById("t1").value;
    var t2 = +document.getElementById("t2").value;
    var k = [-2, -4, -5, 3, 8];
    /* object for relevance */
    var relevance = new Relevance(t1, t2);

    /* generate events */
    var eventsLifo = eventGenerator(n, lambda, myu);
    var eventsRand = copyArrayOfObject(eventsLifo);
    /*run lifoQMS*/
    lifoQMS(eventsLifo, relevance, k);
    /*run randQMS*/
    randQMS(eventsRand, relevance, k);

    /*output*/

    document.getElementById("lifo_deviation").innerHTML = LifoDeviationInSystem.toFixed(5);
    document.getElementById("rand_deviation").innerHTML = RandDeviationInSystem.toFixed(5);

    document.getElementById("lifo_average_system_time").innerHTML = LifoAverageInSystemTime.toFixed(5);
    document.getElementById("rand_average_system_time").innerHTML = RandAverageInSystemTime.toFixed(5);

    document.getElementById("lifo_average_wait_time").innerHTML = LifoAverageWaitTime.toFixed(5);
    document.getElementById("rand_average_wait_time").innerHTML = RandAverageWaitTime.toFixed(5);

    document.getElementById("lifo_average_serve_time").innerHTML = LifoAverageServeTime.toFixed(5);
    document.getElementById("rand_average_serve_time").innerHTML = RandAverageServeTime.toFixed(5);

    document.getElementById("lifo_total_relevance").innerHTML = LifoTotalRelevance.toFixed(5);
    document.getElementById("rand_total_relevance").innerHTML = RandTotalRelevance.toFixed(5);

    document.getElementById("lifo_function").innerHTML = LifoFunction.toFixed(5);
    document.getElementById("rand_function").innerHTML = RandFunction.toFixed(5);





}





