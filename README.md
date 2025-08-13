# sinew

Sinew is a universal router that uses the URL as the source of state. Sinew allows the formulation of a state vocabulary by partioning the URL (e.g. by grouping path parameters or query string parameters) into exclusive subgroups (or sub-states). Sinew includes a way to resolve dependencies per state such that the dependencies are available for all sub-states of a state. Sinew also decouples the definition of the states from when they are acted on through the pathfinder and director concepts.

## Usage
```
import { Pathfinder, Director, start, navigate } from "./router.js";

const pathfinder2 = new Pathfinder(
    {
        hash: false,
        base: "http://localhost:4000",
        context: {},
    },
    [
        {
            name: "world",
            path: ["q"],
            pathRegex: new RegExp("/world(?<q>.*)"),
            pathString: function (groups) {
                return `/world${groups.q}`;
            },
            search: ["b"],
            dependencies: async function (context, dependencies, state, routeParams, searchParams) {
                console.log("world dependency context", context);
                console.log("world dependency called", dependencies, state, routeParams, searchParams);
                return {
                    y: 20,
                };
            },
        },
        {
            name: "universe",
            path: ["e"],
            pathRegex: new RegExp("/universe(?<e>.*)"),
            pathString: function (groups) {
                return `/universe${groups.e}`;
            },
            search: ["b"],
            dependencies: async function (context, dependencies, state, routeParams, searchParams) {
                console.log("universe dependency context", context);
                console.log("universe dependency called", dependencies, state, routeParams, searchParams);
                return {
                    z: 30,
                };
            },
        },
    ],
);

var pathfinder1 = new Pathfinder(
    {
        hash: false,
        base: "http://localhost:4000",
        context: {},
    },
    [
        {
            name: "hello",
            path: ["w"],
            pathRegex: new RegExp("/hello(?<w>.*?)/"),
            pathString: function (groups) {
                return `/hello${groups.w}`;
            },
            search: ["a"],
            dependencies: async function (context, dependencies, state, routeParams, searchParams) {
                console.log("hello dependency context", context);
                console.log("hello dependency called", dependencies, state, routeParams, searchParams);
                return {
                    x: 10,
                };
            },
            pathfinder: pathfinder2,
        },
    ],
);

const pathfinder4 = new Pathfinder(
    {
        hash: true,
        base: "http://localhost:4000",
        basePath: "/gauze",
        context: {},
    },
    [
        {
            name: "world",
            path: ["q"],
            pathRegex: new RegExp("/world(?<q>.*)"),
            pathString: function (groups) {
                return `/world${groups.q}`;
            },
            search: ["b"],
            dependencies: async function (context, dependencies, state, routeParams, searchParams) {
                console.log("world dependency context", context);
                console.log("world dependency called", dependencies, state, routeParams, searchParams);
                return {
                    y: 20,
                };
            },
        },
        {
            name: "universe",
            path: ["e"],
            pathRegex: new RegExp("/universe(?<e>.*)"),
            pathString: function (groups) {
                return `/universe${groups.e}`;
            },
            search: ["b"],
            dependencies: async function (context, dependencies, state, routeParams, searchParams) {
                console.log("universe dependency context", context);
                console.log("universe dependency called", dependencies, state, routeParams, searchParams);
                return {
                    z: 30,
                };
            },
        },
    ],
);

var pathfinder3 = new Pathfinder(
    {
        hash: true,
        base: "http://localhost:4000",
        basePath: "/gauze",
        context: {},
    },
    [
        {
            name: "hello",
            path: ["w"],
            pathRegex: new RegExp("/hello(?<w>.*?)/"),
            pathString: function (groups) {
                return `/hello${groups.w}/`;
            },
            search: ["a"],
            dependencies: async function (context, dependencies, state, routeParams, searchParams) {
                console.log("hello dependency context", context);
                console.log("hello dependency called", dependencies, state, routeParams, searchParams);
                return {
                    x: 10,
                };
            },
            pathfinder: pathfinder4,
        },
    ],
);

const director1 = new Director();
director1.register("hello.world", function (context, dependencies, pathParams, searchParams) {
    console.log("hello.world director handler", context, dependencies, pathParams, searchParams);
});
director1.register("hello.universe", function (context, dependencies, pathParams, searchParams) {
    console.log("hello.universe director handler", context, dependencies, pathParams, searchParams);
});

// pathfinder URLToState and stateToURL for resolving states from URL and URL from state
const state1 = pathfinder1.URLToState("/hello1/world2?a=30&b=40");
const url1 = pathfinder1.stateToURL(state1.name, state1.pathParams, state1.searchParams);

// pathfinder transitionByState and transitionByURL functions will resolve state dependencies
pathfinder1.transitionByState("hello.world", { q: 2, w: 1 }, { a: 30, b: 40 }).then(function ({ context, dependencies, name, pathParams, searchParams }) {
    director1.handle(name, context, dependencies, pathParams, searchParams);
    return pathfinder1.transitionByURL("/hello1/universe3?a=30&b=40").then(function ({ context, dependencies, name, pathParams, searchParams }) {
        director1.handle(name, context, dependencies, pathParams, searchParams);
    });
});

pathfinder3.transitionByState("hello", { q: 2, w: 1 }, { a: 30, b: 40 }).then(function ({ context, dependencies, name, pathParams, searchParams }) {
    director1.handle(name, context, dependencies, pathParams, searchParams);
    return pathfinder3.transitionByURL("/gauze/?a=30&b=40#/hello1/universe3").then(function ({ context, dependencies, name, pathParams, searchParams }) {
        director1.handle(name, context, dependencies, pathParams, searchParams);
    });
});

// helper functions start and navigate

// start is used from the browser and watches location.href for changes to trigger pathfinder.transitionByURL and on successful transition, will call the director at the associated state
// initial defines the state to load when the current URL is not a valid state
// push specifies to use the history.pushState methods instead of location methods
// retry is the number of times to retry a state transition when a state transition encounters an error
start(pathfinder1, director1, {
	initial: {
		name: "hello.world",
		pathParams: {
			q: 2, w: 1
		},
		searchParams: {
			a: 30,
			b: 40
		}
	},
	push: true,
	retry: 4
}

// navigate is used to trigger URL changes
// if supplied, state will be used in history.pushState as the state object associated with the URL
// if supplied, pathfinder will be used to construct the state used in history.pushState as the state object associated with the URL
// if neither state or pathfinder are supplied and push is true, then an empty object will be used in history.pushState as the state object associated with the URL
// replace specifies whether to use location.replace or history.replaceState instead of location.href or history.pushState
navigate("/hello1/universe3?a=30&b=40", {
	push: true,
	replace: true,
	state: {
		name: "hello.world",
		pathParams: {
			q: 2,
			w: 1
		},
		searchParams: {
			a: 30,
			b: 40
		}
	},
	pathfinder: pathfinder1
})
```
