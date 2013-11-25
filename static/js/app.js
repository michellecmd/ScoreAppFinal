var APP = APP || {};

(function () { //Self involking function omdat je wil dat ze code zichzelf helemaal uitvoert

	"use strict";

	APP.utils = {

		//Hieronder verander ik het format van de tijd van start_time: "2013-10-21T13:00:00+02:00", waarbij telkens enkele karakters selecteer (altijd TOT het laatste getal)
		dateFormat: function(dateToChange) { 
			var year = dateToChange.substring(0, 4), 
			month = dateToChange.substring(5, 7), 
			day = dateToChange.substring(8, 10), 
			hour = dateToChange.substring(11, 13), 
			minutes = dateToChange.substring(14, 16);

			return day + "-" + month + "-" + year + " " + hour + ":" + minutes; 
		},

		//LOADER                
		spinner: {
		    object: document.getElementById('spinner'),
                show: function () {
                    this.object.className = "spinner";
                },
                hide: function () {
                    this.object.className = "nospin";
                }
        },

        animation: {
            popup: function(element, callbackFunction) { //het element (bepaald in de change) bepaald welke secties in de css op "animationStart" gezet worden

               	element.className = "animationStart"; //zet de juiste classes op animationStart zodat deze animeren volgens de code in de css

               	setTimeout(function () {
               		element.className = "active"; //'pagina van animationStart op actief zetten, omdat tijdens de animatie alle sections nog op non-active staan door de change functie'
               	}, 1500); //dit gebeurd wel pas na 1,5 sec

            }
    	},

    	feedback: {
    		object: document.getElementById('feedback'), //document verwijst naar de DOM en daarbinnen naar een elemenent met het ID 'feedback'

    		show: function (message) {
    			this.object.innerHTML = message;
    			this.object.className = "showFeedback";

    			var self = this;

    			setTimeout(function () {
    				self.hide(); //vanwege disclosure moet je hier self gebruiken omdat je wil verwijzen naar het object buiten de function van setTimeout
    			}, 1500);
    		},
    		hide: function () {
    			this.object.className = "noShowFeedback";
    		}
    	}
	};
	
	APP.game = { //Code literal, omdat we dit object maar één keer gaan gebruiken
		//simulatie van data uit een database
		title:'Update score',
		gameResults : [],

		getGameResults: function (gameID) {
			APP.utils.spinner.show();
			var self = this;
	    	promise.get('https://api.leaguevine.com/v1/game_scores/?tournament_id=19389&game_id=' + gameID + '&access_token=2371ee3be6').then(function(error, text, xhr) {

			    if (error) {
			        alert('Error ' + xhr.status);
			        return;
			    }

			    var data = JSON.parse(text);

		    	self.gameResults = {
	    			game_id: gameID,
					team_1_name: data.objects[0].team_1.name,
					team_1_score: data.objects[0].team_1_score,
					team_2_score: data.objects[0].team_2_score,
					team_2_name: data.objects[0].team_2.name,
					is_final: data.objects[0].is_final
		  		};

			    APP.page.render('game');
			    APP.utils.spinner.hide();
			});
		},

		updateScores: function (gameID, team_1_score, team_2_score, final) {
			APP.utils.spinner.show();
			POSTMADEEASY.doPost(gameID, team_1_score, team_2_score, final, function () {
				
				APP.utils.feedback.show("Update done!"); //Dit wordt de feedback message 

				APP.utils.spinner.hide();
			});
		}
	};


	APP.schedule = {

		name: 'Next pool',
		scoreSchedule: [],

		activePool: 0,

		getSchedule: function (poolID) {
			switch(poolID) {
        		case "19219":
        			this.activePool = 0;
        			APP.schedule.title = 'Schedule A';
        			break; //Break onderbreekt de switch code door die statement te stoppen en door te gaan buiten die statement
        		case "19220":
        			this.activePool = 1;
        			APP.schedule.title = 'Schedule B';
        			break;
        		case "19221":
        			this.activePool = 2;
        			APP.schedule.title = 'Schedule C';
        			break;
        		case "19222":
        			this.activePool = 3;
        			APP.schedule.title = 'Schedule D';
        			break;
        	}
			APP.utils.spinner.show();
			var self = this;
	    	promise.get('https://api.leaguevine.com/v1/games/?tournament_id=19389&pool_id=' + poolID + '&access_token=fcf6a5be18').then(function(error, text, xhr) {
			    if (error) {
			        alert('Error ' + xhr.status);
			        return;
			    }

			    var data = JSON.parse(text);

				for (var i = 0; i < data.objects.length; i++) {
			    	// schrijf poolnaam in array weg
			    	self.scoreSchedule[i] = { //niet naar promise maar naar App.schedule omdat je naar scoreSchedule: [], verwijst
			    		gameID: data.objects[i].id,
			    		start_time: APP.utils.dateFormat(data.objects[i].start_time), //past de 'rauwe' datum aan naar een gestyleerde vorm 
						team_1_name: data.objects[i].team_1.name,
						team_1_score: data.objects[i].team_1_score,
						team_2_score: data.objects[i].team_2_score,
						team_2_name: data.objects[i].team_2.name
			    	};
 			    }

			    APP.page.render('schedule');
			    APP.utils.spinner.hide();
			});
		},

		switchPool: function () {
			switch(this.activePool) {
        		case 0:
        			APP.schedule.title = 'Schedule A';
        			APP.schedule.getSchedule(19219);
        			break;
        		case 1:
        			APP.schedule.title = 'Schedule B';
        			APP.schedule.getSchedule(19220);
        			break;
        		case 2:
        			APP.schedule.title = 'Schedule C';
        			APP.schedule.getSchedule(19221);
        			break;
        		case 3:
        			APP.schedule.title = 'Schedule D';
        			APP.schedule.getSchedule(19222);
        			break;
        	}
		}

	};

	APP.ranking = {
		title:'Ranking',
		scoreRanking: [],

		getRankings: function () {
			APP.utils.spinner.show();
			var self = this; //spreekt dus APP.ranking aan
			promise.get('https://api.leaguevine.com/v1/pools/?tournament_id=19389&order_by=%5Bname%5D&access_token=fcf6a5be18').then(function(error, text, xhr) { 
			//&order_by=%5Bname%5D& zorgt voor de volgorde van A naar D
			//xhr = xml http request
			    if (error) {
			        alert('Error ' + xhr.status);
			        return;
			    }
			//Als de get fout gaat, geeft het een error in een alert en stopt het uitvoeren van getRankings met een return    
			    var data = JSON.parse(text);
			// Zet de text(JSON string) om in data in een array

			    // voor elke pool data -> zet terug in scoreRanking array
			    for (var i = 0; i < data.objects.length; i++) {
			    	// schrijf poolnaam in array weg
			    	self.scoreRanking[i] = {
			    		name: "Pool " + data.objects[i].name,
			    		poolID: data.objects[i].id
			    	};

			    	self.scoreRanking[i].teams = [];

			    	for (var t = 0; t < data.objects[i].standings.length; t++) { //een loop per pool om de gegevens uit de 'standings' te halen van Leaguevine. [i]=de pool [t]=team gegevens
			    		self.scoreRanking[i].teams[t] = {
			    			name: data.objects[i].standings[t].team.name,
			    			games_played: data.objects[i].standings[t].games_played,
			    			wins: data.objects[i].standings[t].wins,
			    			losses: data.objects[i].standings[t].losses,
			    			points_scored: data.objects[i].standings[t].points_scored,
			    			points_allowed: data.objects[i].standings[t].points_allowed,
			    			plus_minus: data.objects[i].standings[t].plus_minus
			    		}
			    	};
 			    }


			    APP.page.render('ranking');
			    APP.utils.spinner.hide();
			});
		}
	};
	
	// Controller 
	APP.controller = {
		init: function () {
			// Hier wordt een init gebruikt omdat je wil dat je later in de code deze functie weer kan activeren
			APP.router.init();
			//nameSpace.object.methode(parameter)

			Hammer(document.getElementById("schedule")).on("swipeleft", function(event) { //Hammer is de library. "swipeleft" is gespecificeerd in de lib
				//Het is een callbackfunctie, omdat deze alleen uitgevoerd wordt als 'swipeleft' geactiveerd wordt door de gebruiker, ongeacht waar in het script we zijn
            	if(APP.schedule.activePool < 3) {
					APP.schedule.activePool++;
            	} else {
            		APP.schedule.activePool = 0;
            	}

            	APP.schedule.switchPool();

            });

			Hammer(document.getElementById("schedule")).on("swiperight", function(event) {

            	if(APP.schedule.activePool > 0) {
					APP.schedule.activePool--;
            	} else {
            		APP.schedule.activePool = 3;
            	}

				APP.schedule.switchPool();

            });
		}
	};

	// Router, spreekt de lib routie aan om te zorgen dat de juiste content van de juiste pagina getoond wordt aan de hand van user input
	// De user input is doormiddel van het klikken op een link naar een nieuwe pagina met een nieuwe url
	APP.router = {
		init: function () {
	  		routie({
			    '/game/:gameID': function(gameID) {
			    	APP.game.getGameResults(gameID);
				},
			    '/schedule/:poolID': function(poolID) {
			    	APP.schedule.getSchedule(poolID);
			    },

			    '/ranking': function() {
			    	APP.ranking.getRankings();
			    },
			    '*': function() {
			    	window.location = '#/ranking'; 
			    }	
			}); 
			//routie('/:name', function(name) {
			//		APP.page.render(name);
			//});
		}, 

		change: function () {
            /*var route = window.location.hash.slice(2),
            	// route = ScoreApp/index.html#/ + alles achter de slash, bijv: schedule/19222
                sections = qwery('section');
                // Haalt alle sections op 
            if(route.search("/") != -1) { //if route heeft een / in zich, dan...
            	route = route.substring(0, route.search("/")); //hak de route in stukken en hou alleen alles voor de / over
            }

            var section = qwery('[data-route=' + route + ']')[0]; //welke sections moeten zichtbaar zijn volgens de data-route die de secties hebben

            // Toon alleen de actieve pagina, de rest niet
            if (section) {
            	for (var i=0; i < sections.length; i++){
            		sections[i].classList.remove('active');
            	}
            	section.classList.add('active');
            }

            // De standaard route, als een andere route niet herkend wordt
            if (!route) {
            	sections[0].classList.add('active');
            }*/

            var route = window.location.hash.slice(2);
            if(route.search("/") != -1)
                                route = route.substring(0, route.search("/"));
                
                
                var sections = qwery('section[data-route!='+ route +']')
                for(var i = 0; i < sections.length; i++) {
                        sections[i].classList.remove('active');
                }
                        
                
                var sectionToChange = qwery('[data-route=' + route + ']')[0];
                APP.utils.animation.popup(sectionToChange, function() {});
                sectionToChange.classList.add('active');

		}
	};

	// Aanmaken van de pagina, vullen van data
	// Met qwery spreekt Transparency de DOM aan, in dit geval de elementen met 'data-route'
	// Qwery geeft arrays terug
	APP.page = {
		render: function (route) {
			var data = APP[route];

			var directives = {
				scoreRanking: {
					anchor: {
						href: function(params) {
							return "#/schedule/" + this.poolID;
						}
					}
				},

				scoreSchedule: {
					anchor: {
						href: function(params) {
							return "#/game/" + this.gameID;
						}
					}
				},

				gameResults: {
					team_1_plus: {
						onclick: function (params) {
							var gameid = this.game_id,
								team1score = this.team_1_score,
								team2score = this.team_2_score,
								is_final = this.is_final;

							var newteam1score = parseInt(team1score);
							newteam1score++;

							return "APP.game.updateScores("+ gameid +", "+ newteam1score +", "+ team2score +", "+ is_final +");";
						}
					},

					team_1_min: {
						onclick: function (params) {
							var gameid = this.game_id,
								team1score = this.team_1_score,
								team2score = this.team_2_score,
								is_final = this.is_final;

							var newteam1score = parseInt(team1score);
							newteam1score--;

							return "APP.game.updateScores("+ gameid +", "+ newteam1score +", "+ team2score +", "+ is_final +");";
						}
					},

					team_2_plus: {
						onclick: function (params) {
							var gameid = this.game_id,
								team1score = this.team_1_score,
								team2score = this.team_2_score,
								is_final = this.is_final;

							var newteam2score = parseInt(team2score);
							newteam2score++;

							return "APP.game.updateScores("+ gameid +", "+ team1score +", "+ newteam2score +", "+ is_final +");";
						}
					},

					team_2_min: {
						onclick: function (params) {
							var gameid = this.game_id,
								team1score = this.team_1_score,
								team2score = this.team_2_score,
								is_final = this.is_final;

							var newteam2score = parseInt(team2score);
							newteam2score--;

							return "APP.game.updateScores("+ gameid +", "+ team1score +", "+ newteam2score +", "+ is_final +");";
						}
					}
				}

				/*arrayNaam: {
					anchor: databïnd object in je html: {
						de attributen in je html object: function(params) {
							return de waarde van de attribuut die je wilt aanpassen
						}
					}
				}*/
			};

			Transparency.render(qwery('[data-route=' + route + ']')[0], data, directives);
			APP.router.change();
		}
	};

	// DOM ready, pas als de DOM (HTML) klaar is wordt de APP.controler gestart. Dit helpt voorkomen dat JavaScript al uitgevoerd wordt zonder dat deze geplaatst kan worden en dan wordt de content niet getoont.
	domready(function () { //Self involking function
		// Start de APP.controller.init als de DOM helemaal geladen is
		APP.controller.init();
	});
	
})();