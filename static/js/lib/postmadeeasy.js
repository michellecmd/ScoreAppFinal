var POSTMADEEASY = POSTMADEEASY || {};

POSTMADEEASY.settings = {
        authorization: "d1a4f8f633"
};

(function () {

        POSTMADEEASY.doPost = function (game_id, team_1_score, team_2_score, final, callbackFunction) {

                var xhr = new XMLHttpRequest();

                var data = {
                        "game_id":                         game_id,
                        "team_1_score":         team_1_score,
                        "team_2_score":         team_2_score,
                        "final":                         final
                };

                xhr.open("POST","https://api.leaguevine.com/v1/game_scores/",true);

                xhr.setRequestHeader("Content-Type","application/json");
                xhr.setRequestHeader("Accept","application/json");
                xhr.setRequestHeader("Authorization","bearer " + POSTMADEEASY.settings.authorization);

                xhr.send(JSON.stringify(data));

                xhr.onreadystatechange = function() {
                         if(xhr.readyState == 4) {
                                 callbackFunction();
                         }
                 }

        };

})();