var svg = d3.select("#plain");

var mergeOptions = function(options1, options2) {
    var newOptions = cloneOf(options1);
    for (var key in options2) {
        if (options2.hasOwnProperty(key)) {
            newOptions[key] = options2[key];
        }
    }
    return newOptions;
};

var cloneOf = function(obj) {
    if (obj === null || typeof(obj) !== 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            temp[key] = cloneOf(obj[key]);
        }
    }
    return temp;
};

var createLeg = function(x1, x2, x3, x4, d) {
    return "M " + x1*d + " " + x2*d + " L "+ x3*d + " "+ x4*d +"";
};


var AntDispatcher;
AntDispatcher = {

    options: {
        numberOfAnts: 30,
        minDimension: 20,
        maxDimension: 100
    },

    initialize: function (options) {
        this.options = mergeOptions(this.options, options);
        this.ants = [];
        this.createAnts();
    },

    createAnts: function () {
        var numberOfAnts = this.options.numberOfAnts;

        for (var i = 0; i < numberOfAnts; i++) {
            var options = JSON.parse(JSON.stringify(this.options));
            var a = SpawnAnt();
            options.id = i;
            options.dimension = this.random(this.options.minDimension, this.options.maxDimension, true);
            a.initialize(options);
            this.ants.push(a);
        }

        var ants = this.ants;

        d3.select('#plain').attr("toggle", true);

        d3.select("#plain").on('mousemove', function (data, index) {

            var evt1 = window.event  || d3.event;
            ants.forEach(function (element) {
                //element.walkAgainst(evt1);

                setTimeout(function(){
                    element.walkAgainst(evt1);
                }, 10);

            });

        });

        d3.select("#plain").on('click',  function(data, index) {
            var evt0 = window.event  || d3.event;
            console.log(data, index);
            ants.forEach(function(element){
                element.stopAnt(10);
            });

            if (this.toggle) {
                d3.selectAll(".eyes").attr("fill", "red");
                d3.select("#plain").on('mousemove', function (data, index) {

                    var evt1 = window.event  || d3.event;
                    ants.forEach(function (element) {
                        //element.walkAgainst(evt1);

                        setTimeout(function(){
                            element.walkAgainst(evt1);
                        }, 10);

                    });

                });
                ants.forEach(function (element) {
                    element.removeEventListener("mouseover");
                    //element.walkAgainst(evt0);

                    setTimeout(function() {
                        element.walkAgainst(evt0);
                    }, 10);

                });
            } else {
                d3.selectAll(".eyes").attr("fill", "white");
                d3.select("#plain").on("mousemove", null);
                d3.selectAll(".ants").transition();
                ants.forEach(function(element) {
                    var el = element;
                    setTimeout(function() {
                        el.addEventListener("mouseover")
                    }, 10);
                })
            }
            this.toggle = !this.toggle;
        });
    },


    random: function (min, max, floor) {
        if (min === max) return ((floor) ? Math.floor(min) : min);

        var result = ((min - 0.5) + (Math.random() * (max - min + 1)));
        if (result > max) {
            result = max;
        } else if (result < min) {
            result = min;
        }
        return ((floor) ? Math.floor(result) : result);
    }

};


var SpawnAnt = function() {
    var newAnt = {},
        prop;
    for (prop in Ant) {
        if (Ant.hasOwnProperty(prop)) {
            newAnt[prop] = Ant[prop];
        }
    }
    return newAnt;
};

var Ant = {
    options: {
        id: 1,
        dimension: 30,
    },

    initialize: function (options) {
        this.options = mergeOptions(this.options, options);
        this.angle_deg = this.random(0, 360, false);
        this.id = this.options.id;
        this.makeAnt();
        this.toDegree = 180 / Math.PI;

    },

    addEventListener: function(eventType) {
        if (eventType === "mouseover") {
            var self = this;
            d3.select("#ant"+this.id).on("mouseover", function(event) {
                self.runAway(event);
            })
        }
    },

    removeEventListener: function(eventType) {
        if (eventType === "mouseover") {
            d3.select("#ant" + this.id).on("mouseover", null);
        }
    },

    walkAgainst: function(event) {
        event = event || window.event;

        if (event.pageX === null && event.clientX !== null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
                (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        var _this = d3.select("#ant"+this.id);

        var coords = this.parseTranslate(_this.attr('transform'));

        if (coords.length !== 0) {
            this.translateX = coords[0];
            this.translateY = coords[1];
        }
        this.angle_deg = this.degree(event.pageX, event.pageY);


        var velocity = parseFloat(_this.attr('velocity'));

        var distance = Math.sqrt(Math.pow(event.pageX - this.translateX, 2) +
            Math.pow(event.pageY - this.translateY, 2));
        var time_exec = distance/velocity;
        this.translateX = event.pageX;
        this.translateY = event.pageY;
        this.elementCenterX = this.translateX + this.width/2;
        this.elementCenterY = this.translateY + this.height/2;

        var transform = 'translate('+ this.translateX +', '+ this.translateY +')' +
            'rotate('+this.angle_deg +')';

        var animation = this.animateAnt(time_exec+300);
        _this.transition()
            .delay(300)
            .duration(time_exec)
            .attr("transform", transform);
        },


    runAway: function(event) {
        var _this = d3.select("#ant"+this.id);
        _this.transition();

        do {
            var x = this.getRandomX();
            var y = this.getRandomY();
            var distance = Math.sqrt(Math.pow(x - this.translateX, 2) +
                Math.pow(y - this.translateY, 2));
        } while(distance < 100);


        var coords = this.parseTranslate(_this.attr('transform'));

        if (coords.length !== 0) {
            this.translateX = coords[0];
            this.translateY = coords[1];
            this.elementCenterY = this.translateY + this.height/2;
            this.elementCenterX = this.translateX + this.width/2;
        }
        this.angle_deg = this.degree(x, y);

        var velocity = parseFloat(_this.attr('velocity'));

        var time_exec = distance/velocity;

        this.translateX = x;
        this.translateY = y;
        this.elementCenterX = this.translateX + this.width/2;
        this.elementCenterY = this.translateY + this.height/2;

        var transform = 'translate('+ this.translateX +', '+ this.translateY +')' +
            'rotate('+this.angle_deg +')';


        this.animateAnt(time_exec);
        _this.transition()
            .delay(300)
            .duration(time_exec)
            .attr("transform", transform);
    },

    animateAnt: function(time_exec) {
        var g = d3.select("#ant"+this.id);
        var next = 1;
        var d = this.dimension;

        this.stopAnt(1);
        this.anim = setInterval(function() {
            if (next % 2 === 0){
                var leg1 = g.select("#leg"+1)
                    .attr("d", createLeg(25, 37.5, 2.5, 0, d));

                g.select("#leg"+3)
                    .attr("d", createLeg(25, 37.5, 47.5, 0, d));

                g.select("#leg"+5)
                    .attr("d", createLeg(25, 37.5, 2.5, 70, d));

                g.select("#leg"+6)
                    .attr("d", createLeg(25, 37.5, 47.5, 70, d));

            } else  {

                g.select("#leg"+1)
                    .attr("d", createLeg(25, 37.5, 2.5, 10, d));

                g.select("#leg"+3)
                    .attr("d", createLeg(25, 37.5, 47.5, 10, d));

                g.select("#leg"+5)
                    .attr("d", createLeg(25, 37.5, 2.5, 60, d));

                g.select("#leg"+6)
                    .attr("d", createLeg(25, 37.5, 47.5, 60, d));

            }
            next++;
        }, time_exec/15);
        this.stopAnt(time_exec);
    },

    stopAnt: function(time_exec) {
        var anim = this.anim;
        setTimeout(function() {
            clearInterval(anim)
        }, time_exec);
    },

    makeAnt: function () {
        var d = this.options.dimension /100;
        this.dimension = d;
        this.height = d * 75;
        this.width = d * 50;
        this.diagonal = Math.sqrt(Math.pow(this.height, 2) +
            Math.pow(this.width, 2));
        var x = this.getRandomX();
        var y = this.getRandomY();
        var velocity =5/(Math.sqrt(75*50)*d);
        var ant = svg.append('g')
            .attr('id', 'ant' + this.id)
            .attr('class', 'ants')
            .attr("height", 75*d)
            .attr("width", 50*d)
            .attr('velocity', velocity);
        ant.append("ellipse")
            .attr("cx", 25*d)
            .attr("cy", 35*d)
            .attr("rx", 10*d)
            .attr("ry", 15*d);
        ant.append("path")
            .attr('stroke', 'black')
            .attr("d", createLeg(25, 10, 5, 0, d));
        ant.append("path")
            .attr('stroke', 'black')
            .attr("d", createLeg(25, 10, 45, 0, d));

        ant.append("circle")
            .attr("r", 10*d)
            .attr("cx", 25*d)
            .attr("cy", 10*d);

        ant.append("circle")
            .attr("class", "eyes")
            .attr("r", 1.5*d)
            .attr("cx", 19*d)
            .attr("cy", 6.5*d)
            .attr("fill", "red");

        ant.append("circle")
            .attr("class", "eyes")
            .attr("r", 1.5*d)
            .attr("cx", 31*d)
            .attr("cy", 6.5*d)
            .attr("fill", "red");


        ant.append("circle")
            .attr("r", 12.5*d)
            .attr("cx", 25* d)
            .attr("cy", 62.5*d);

        ant.append("path")
            .attr("id", "leg"+1)
            .attr('stroke', 'black')
            .attr('stroke-width', 3*d)
            .attr("d", createLeg(25, 37.5, 2.5, 10, d));

        ant.append("path")
            .attr("id", "leg"+2)
            .attr('stroke', 'black')
            .attr('stroke-width', 3*d)
            .attr("d", createLeg(25, 37.5, 2.5, 37.5, d));

        ant.append("path")
            .attr("id", "leg"+3)
            .attr('stroke', 'black')
            .attr('stroke-width', 3*d)
            .attr("d", createLeg(25, 37.5, 47.5, 10, d));

        ant.append("path")
            .attr("id", "leg"+4)
            .attr('stroke', 'black')
            .attr('stroke-width', 3*d)
            .attr("d", createLeg(25, 37.5, 47.5, 37.5, d));

        ant.append("path")
            .attr("id", "leg"+5)
            .attr('stroke', 'black')
            .attr('stroke-width', 3*d)
            .attr("d", createLeg(25, 37.5, 2.5, 60, d));

        ant.append("path")
            .attr("id", "leg"+6)
            .attr('stroke', 'black')
            .attr('stroke-width', 3*d)
            .attr("d", createLeg(25, 37.5, 47.5, 60, d));

        ant.attr('transform', 'translate('+ x +', '+ y +') ' +
            'rotate('+this.angle_deg+ ')');
        this.translateX = x;
        this.translateY = y;
        this.elementCenterX = this.width/2 + x;
        this.elementCenterY = this.height/2 + y;
    },

    parseTranslate: function(transform) {
        var sCoords = transform.substring(transform.search("translate")+10, transform.indexOf(')')).split(',');
        var coords = [parseFloat(sCoords[0]), parseFloat(sCoords[1])];
        if(isNaN(coords[0]) || isNaN(coords[1])) {
            console.log("isNAN");
            return [];
        }
        else {
            return coords;
        }
    },

    degree: function(ex, ey) {
        var dy = ey -this.translateY;
        var dx = ex - this.translateX;

        var ipo = Math.sqrt(Math.pow(dx,2) + Math.pow(dy, 2));
        var theta;
        if (dx > 0 && dy >0) {
            theta = 90 + Math.asin(dy/ipo)*this.toDegree;
        } else if (dy <0 && dx >0) {
            theta = Math.asin(dx/ipo) *this.toDegree;
        } else if (dy> 0 && dx < 0) {
            dx = Math.abs(dx);
            theta = 180 + Math.asin(dx/ipo)*this.toDegree;
        } else if (dx < 0 && dy < 0) {
            dy = Math.abs(dy);
            theta = 270 + Math.asin(dy/ipo)*this.toDegree;
        } else if (dx = 0 && dy > 0) {
            theta = 180;
        } else if (dx = 0 && dy < 0) {
            theta = 0;
        } else if (dy = 0 && dx < 0) {
            theta = 270;
        } else if (dy = 0 && dx > 0) {
            theta = 90;
        } else {
            theta = this.angle_deg;
        }

        theta = Math.atan2(dy, dx) * this.toDegree;
        return theta;
    },

    getRandomX: function () {
        var diag = this.diagonal;
        var width = parseInt(svg.style("width"), 10) - diag;

        var min = diag - this.width;
        return Math.ceil(min + (Math.random() * (width - min)));
    },
    getRandomY: function () {
        var diag = this.diagonal;
        var height = parseInt(svg.style("height"), 10) - diag;
        var min = diag - this.height;

        return Math.ceil(min + (Math.random() * (height - diag)));
    },

    random: function(min, max, plusminus) {
        if (min === max) return min;
        var result = Math.round(min - 0.5 + (Math.random() * (max - min + 1)));
        if (plusminus) return Math.random() > 0.5 ? result : -result;
        return result;
    }

};

var AntController = function() {
    AntDispatcher.initialize.apply(this, arguments);
};
AntController.prototype = AntDispatcher;

new AntController({
    numberOfAnts: 30
});
