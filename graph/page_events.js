var fs = require('fs');

var skullys = [
    {
        "name": "Damn, Girl!",
        "start_time": "2018-12-21T22:00:00-0500",
        "id": "128776981130874"
    },
    {
        "name": "Damn, Girl!",
        "start_time": "2018-11-16T22:00:00-0500",
        "id": "161433241265236"
    },
    {
        "name": "Damn, Girl!",
        "start_time": "2018-10-19T22:00:00-0400",
        "id": "189519364942598"
    },
    {
        "name": "Damn, Girl!",
        "start_time": "2018-09-21T22:00:00-0400",
        "id": "351466501930988"
    },
    {
        "name": "Damn, Girl!",
        "start_time": "2018-08-17T22:00:00-0400",
        "id": "533789533664466"
    },
    {
        "name": "Damn, Girl!",
        "start_time": "2018-07-20T22:00:00-0400",
        "id": "188371451728209"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-06-28T21:00:00-0400",
        "id": "169471107113522"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-06-21T21:00:00-0400",
        "id": "395312244216236"
    },
    {
        "name": "Damn, Girl!",
        "start_time": "2018-06-15T22:00:00-0400",
        "id": "2025224517746304"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-06-14T21:00:00-0400",
        "id": "203925190163276"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-06-07T21:00:00-0400",
        "id": "322781841544981"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-05-31T21:00:00-0400",
        "id": "2145571059005268"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-05-24T21:00:00-0400",
        "id": "510570172661061"
    },
    {
        "name": "Damn, Girl!",
        "start_time": "2018-05-18T22:00:00-0400",
        "id": "325660824509116"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-05-17T21:00:00-0400",
        "id": "2041367669480854"
    },
    {
        "name": "The Flex Crew",
        "start_time": "2018-05-13T22:00:00-0400",
        "id": "369714506789499"
    },
    {
        "name": "Tune-Yards",
        "start_time": "2018-05-12T21:00:00-0400",
        "id": "531509560550939"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-05-10T21:00:00-0400",
        "id": "1171132803019970"
    },
    {
        "name": "The Flex Crew",
        "start_time": "2018-05-06T22:00:00-0400",
        "id": "1354556514672413"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-05-03T21:00:00-0400",
        "id": "455053751556856"
    },
    {
        "name": "The Music of D'Angelo",
        "start_time": "2018-05-01T21:30:00-0400",
        "id": "1449054085221562"
    },
    {
        "name": "The Flex Crew",
        "start_time": "2018-04-29T22:00:00-0400",
        "id": "733703406834611"
    },
    {
        "name": "90s DANCE PARTY at Skully's | Columbus",
        "start_time": "2018-04-28T21:00:00-0400",
        "id": "139999976797231"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-04-26T21:00:00-0400",
        "id": "204634106748759"
    },
    {
        "name": "The Flex Crew",
        "start_time": "2018-04-22T22:00:00-0400",
        "id": "1506966259392601"
    },
    {
        "name": "Turnover w/ Mannequin Pussy / Summer Salt at Skully's (4/22)",
        "start_time": "2018-04-22T19:00:00-0400",
        "id": "879406145555515"
    },
    {
        "name": "Damn, Girl!",
        "start_time": "2018-04-20T22:00:00-0400",
        "id": "333482327119838"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-04-19T21:00:00-0400",
        "id": "1959479517660166"
    },
    {
        "name": "The Flex Crew",
        "start_time": "2018-04-15T22:00:00-0400",
        "id": "130599914371979"
    },
    {
        "name": "Ladies 80s & More: Official Front 242 After Party!",
        "start_time": "2018-04-12T21:00:00-0400",
        "id": "143749356252401"
    },
    {
        "name": "Front 242",
        "start_time": "2018-04-12T19:30:00-0400",
        "id": "215536272324193"
    },
    {
        "name": "Pale Waves w/ INHEAVEN",
        "start_time": "2018-04-10T20:00:00-0400",
        "id": "182138415706888"
    },
    {
        "name": "The Flex Crew",
        "start_time": "2018-04-08T22:00:00-0400",
        "id": "378189619281295"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-04-05T21:00:00-0400",
        "id": "2400969586795779"
    },
    {
        "name": "The Flex Crew",
        "start_time": "2018-04-01T22:00:00-0400",
        "id": "507184616318176"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-03-29T21:00:00-0400",
        "id": "136972050288040"
    },
    {
        "name": "The Flex Crew",
        "start_time": "2018-03-25T22:00:00-0400",
        "id": "143740246351761"
    },
    {
        "name": "Knocked Loose w/ Terror at Skully's Music Diner (3/25)",
        "start_time": "2018-03-25T17:30:00-0400",
        "id": "328428330972048"
    },
    {
        "name": "James McMurtry & John Moreland",
        "start_time": "2018-03-24T21:00:00-0400",
        "id": "834205220084376"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-03-22T21:00:00-0400",
        "id": "562180904118793"
    },
    {
        "name": "The Flex Crew- Late Show",
        "start_time": "2018-03-18T22:00:00-0400",
        "id": "144307086323796"
    },
    {
        "name": "Superior Booking Spring Matinee Show Early Show",
        "start_time": "2018-03-18T15:00:00-0400",
        "id": "391114214669890"
    },
    {
        "name": "Damn, Girl!",
        "start_time": "2018-03-16T22:00:00-0400",
        "id": "131563727556625"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-03-15T21:00:00-0400",
        "id": "495093740867647"
    },
    {
        "name": "The Flex Crew- Late Show",
        "start_time": "2018-03-11T22:00:00-0400",
        "id": "600455833678861"
    },
    {
        "name": "Afton Local Artist Showcase - Early Show",
        "start_time": "2018-03-11T15:45:00-0400",
        "id": "864110910427860"
    },
    {
        "name": "Betty Who",
        "start_time": "2018-03-10T21:00:00-0500",
        "id": "1933542440232119"
    },
    {
        "name": "Ladies 80s & More- Late Show",
        "start_time": "2018-03-08T21:00:00-0500",
        "id": "289120528262395"
    },
    {
        "name": "Joe Marcinek Band - Early Show",
        "start_time": "2018-03-08T15:00:00-0500",
        "id": "138792713556346"
    },
    {
        "name": "Taylor Bennett II 3.6.18 II Skully's",
        "start_time": "2018-03-06T19:00:00-0500",
        "id": "1552526728148163"
    },
    {
        "name": "The Flex Crew- Late Show",
        "start_time": "2018-03-04T22:00:00-0500",
        "id": "156233274989952"
    },
    {
        "name": "Rock in Columbus",
        "start_time": "2018-03-04T15:00:00-0500",
        "id": "163011701005423"
    },
    {
        "name": "Rumourz Tribute to Fleetwood Mac - Early Show",
        "start_time": "2018-03-03T17:00:00-0500",
        "id": "117601442370967"
    },
    {
        "name": "Jasmine Cain at Skullys Music-Diner",
        "start_time": "2018-03-02T20:00:00-0500",
        "id": "1581099421933733"
    },
    {
        "name": "Ladies 80s & More- Late Show",
        "start_time": "2018-03-01T21:00:00-0500",
        "id": "141707426554518"
    },
    {
        "name": "Red & Lacey Sturm",
        "start_time": "2018-03-01T18:30:00-0500",
        "id": "2097099507185088"
    },
    {
        "name": "The Flex Crew",
        "start_time": "2018-02-25T22:00:00-0500",
        "id": "131438760953055"
    },
    {
        "name": "Less Than Jake w/ Four Year Strong at Skully's Music Diner (2/24)",
        "start_time": "2018-02-24T19:00:00-0500",
        "id": "1878592672451320"
    },
    {
        "name": "Silent TRAP Party Columbus, Ohio",
        "start_time": "2018-02-23T21:00:00-0500",
        "id": "209737469587176"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-02-22T21:00:00-0500",
        "id": "2017995821767304"
    },
    {
        "name": "Big Wild w/Daktyl and White Cliffs at Skully's",
        "start_time": "2018-02-21T20:00:00-0500",
        "id": "152723031997528"
    },
    {
        "name": "The Flex Crew- Late Show",
        "start_time": "2018-02-18T22:00:00-0500",
        "id": "1756142278015219"
    },
    {
        "name": "Neil Hilborn at Skully's (2/18) - sold out / 2nd show added",
        "start_time": "2018-02-18T19:00:00-0500",
        "id": "296074997567069"
    },
    {
        "name": "Neil Hilborn at Skully's Music Diner (2/18) - sold out",
        "start_time": "2018-02-18T15:00:00-0500",
        "id": "142718006443801"
    },
    {
        "name": "LeBOOM : KRANE . SLUMBERJACK . Alexander Lewis February 17",
        "start_time": "2018-02-17T20:00:00-0500",
        "id": "1918301521819779"
    },
    {
        "name": "Damn, Girl!",
        "start_time": "2018-02-16T22:00:00-0500",
        "id": "803649299806834"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-02-15T21:00:00-0500",
        "id": "1944984579048098"
    },
    {
        "name": "Mark Wilkinson at Skully's Music-Diner",
        "start_time": "2018-02-14T18:30:00-0500",
        "id": "135807173754252"
    },
    {
        "name": "The Flex Crew- Late Show",
        "start_time": "2018-02-11T22:00:00-0500",
        "id": "192570574648921"
    },
    {
        "name": "Afton Local Artist Showcase - Early Show",
        "start_time": "2018-02-11T15:45:00-0500",
        "id": "196303750920877"
    },
    {
        "name": "The 2018 Broken Hearts Masquerade Ball",
        "start_time": "2018-02-10T22:00:00-0500",
        "id": "379095005851640"
    },
    {
        "name": "CD102.5 Presents Dan Luke and The Raid at Skully's Music Diner",
        "start_time": "2018-02-09T21:00:00-0500",
        "id": "785126181678931"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-02-08T21:00:00-0500",
        "id": "237540030110623"
    },
    {
        "name": "The Showcase Tour",
        "start_time": "2018-02-06T19:00:00-0500",
        "id": "158867881411459"
    },
    {
        "name": "The Shaun Peace Band",
        "start_time": "2018-02-05T19:00:00-0500",
        "id": "966886520126237"
    },
    {
        "name": "The Flex Crew",
        "start_time": "2018-02-04T22:00:00-0500",
        "id": "294892990997379"
    },
    {
        "name": "Get Right ! Feb Edition.",
        "start_time": "2018-02-03T22:00:00-0500",
        "id": "331153570718239"
    },
    {
        "name": "Boogie T & Squnto Strike Back: Columbus",
        "start_time": "2018-02-02T20:00:00-0500",
        "id": "2134755356751936"
    },
    {
        "name": "Ladies 80s & More",
        "start_time": "2018-02-01T21:00:00-0500",
        "id": "171124043471072"
    },
    {
        "name": "Sad Boyz at Skully's | January 31",
        "start_time": "2018-01-31T21:00:00-0500",
        "id": "817998141704803"
    },
    {
        "name": "Noah Gundersen w/ Elizabeth Gundersen",
        "start_time": "2018-01-31T18:45:00-0500",
        "id": "1929741540681054"
    }
]

var data_short = []


//data.forEach(function(event){})

// ISO8601 string representation lets us sort like normal strings and get chronological order
skullys.sort(function(a, b) {
    return (a.start_time < b.start_time) ? -1 : ((a.start_time > b.start_time) ? 1 : 0);
});

//console.log(skullys)



var woodlands = require('./woodlands')
var loadit = function(){
    return new Promise(function(done, fail) {
        console.log(woodlands)
      done()
    })
}


loadit()
    .then(function(){
        console.log("FINISHED")
    })
    .catch(function(e){
        console.log("well shit");
        console.log(e);
    });



