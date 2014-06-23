
var math = mathjs();
var random = function(n) {
    return Math.floor(Math.random() * n);
};

var log = function(object) {
    console.log(object.toString());
}

var constants = {
    source_probability: 0.2,
    destination_probability: 0.2,
    edge_probability: 0.2
};

Node = (function() {
    function Node(label) {
        this.label = label;
        this.edges_in = [];
        this.edges_out = [];
        this.is_source = false;
        this.is_destination = false;
    }

    Node.prototype = {
        toString: function() {
            return "Node(" + this.label + ")";
        }
    };

    return Node;
})();

Edge = (function() {
    function Edge(begin, end) {
        this.begin = begin;
        this.end = end;
        begin.edges_out.push(this);
        end.edges_in.push(this);
        this.timeOnEmptyEdge = random(20);
        this.capacity = 50;
    }

    Edge.prototype = {

    };

    return Edge;

})();

SourceDestinationPair = (function() {
    function SDP(source, destination, demand) {
        this.source = source;
        this.destination = destination;
        this.demand = demand;
    }
    return SDP;
})();

Path = (function() {
    function Path(first_element) {
        this.nodes = [];
        if (first_element) {
            this.nodes = [first_element];
        }
        this.edges = []
    }

    Path.prototype.prependEdge = function(edge) {
        this.nodes.unshift(edge.begin);
        this.edges.unshift(edge);
    };

    Path.prototype.toString = function() {
        return "Path(" + this.nodes.toString() + ")\n";
    };

    return Path
})();

MyGraph = (function() {
    function Graph(n) {
        var i, j;
        this.nodes = [];
        this.sources = [];
        this.destinations = [];

        for(i = 0; i < n; ++i) {
            var node = new Node(i.toString());
            this.nodes.push(node);
            if (Math.random() < constants.source_probability) {
                this.sources.push(node);
                node.is_source = true;
            } else if (Math.random() < constants.destination_probability) {
                this.destinations.push(node);
                node.is_destination = true;
            }
        }

        this.edges = [];
        for(i = 0; i < n; ++i) {
            for (j = 0; j < n; ++j) {
                if (i != j && Math.random() < constants.edge_probability) {
                    var edge = new Edge(this.nodes[i], this.nodes[j]);
                    this.edges.push(edge);
                }
            }
        }

        this.W = [];
        this.P = [];
        for(i = 0; i < this.sources.length; ++i) {
            for (j = 0; j < this.destinations.length; ++j) {
                var sdp = new SourceDestinationPair(this.sources[i], this.destinations[j], random(20));
                sdp.paths = this.paths(this.sources[i], this.destinations[j], []);
                this.P = this.P.concat(sdp.paths);
                this.W.push(sdp);
            }
        }

        if (this.P.length == 0) return;

        console.log(this.sources.length, this.destinations.length, this.P.length);

        this.teta = this.getTeta();
        this.initEdgeVectors();

        var x = math.range(0, this.P.length);
        console.log(this.proectionOnX(x));
    }

    Graph.prototype.paths = function(a, b, excludes) {
        if ($.inArray(a, excludes) != -1) {
            console.log("fjskldfsl");
            return [];
        } else if (a === b) {
            return [new Path(a)];
        } else {
            var graph = this;
            excludes.push(a);
            var result = [];
            $.each(a.edges_out, function(i, edge) {
                if ($.inArray(edge.end, excludes) == -1) {
                    var paths = graph.paths(edge.end, b, excludes);
                    $.each(paths, function(i, path) {
                        path.prependEdge(edge);
                    });
                    result = result.concat(paths);
                }
            });
            excludes.splice(excludes.length - 1, 1);
            return result;
        }
    };

    Graph.prototype.getTeta = function() {
        var teta = [], i, j;
        for (i = 0; i < this.edges.length; ++i) {
            var current_p = [];
            for (j = 0; j < this.P.length; ++j) {
                if ($.inArray(this.edges[i], this.P[j].edges) != -1) {
                    current_p.push(1);
                } else {
                    current_p.push(0);
                }
            }
            teta.push(current_p);
        }
        return math.matrix(teta);
    };

    Graph.prototype.initEdgeVectors = function() {
        this.edgesCapacity = [];
        this.timesOnEmptyEdge = [];
        for(var i = 0; i < this.edges.length; ++i) {
            var edge = this.edges[i];
            this.edgesCapacity.push(edge.capacity);
            this.timesOnEmptyEdge.push(edge.timeOnEmptyEdge);
        }
        this.edgesCapacity = math.matrix(this.edgesCapacity);
        this.timesOnEmptyEdge = math.matrix(this.timesOnEmptyEdge);
    };

    Graph.prototype.G = function(x) {
        var Y = math.multiply(this.teta, x);
        var mu = 1, n = 1;

        var tau = math.select(Y).dotDivide(this.edgesCapacity).dotPow(n).multiply(mu)
            .add(1).dotMultiply(this.timesOnEmptyEdge).done();

        return math.multiply(math.transpose(this.teta), tau);
    };

    Graph.prototype.proectionOnX = function(x) {
        console.log(math.format(x));
        for (var i = 0; i < this.W.length; ++i) {
            var w = this.W[i];
        }
    };


    return Graph;
})();

GraphRenderer = function(graph) {
    var g = new Graph();
    var st = { directed: true,
        "label-style" : {
            "font-size": 20
        }
    };
    $.each(graph.nodes, function(index, node) {
        g.addNode(node.label);
    });
    $.each(graph.edges, function(index, edge) {
        st.label = edge.timeOnEmptyEdge;
        g.addEdge(edge.begin.label, edge.end.label, st);
    });


    layouter = new Graph.Layout.Spring(g);
    renderer = new Graph.Renderer.Raphael('canvas', g, $('#canvas').width(), $('#canvas').height());
    this.redraw = function() {
        layouter.layout();
        renderer.draw();
    };

    this.redraw();
};

$(function() {
    do {
        window.graph = new MyGraph(10);
    } while (window.graph.P.length == 0);
    var renderer = new GraphRenderer(window.graph);

    $('#redraw').on('click', renderer.redraw);
});