// ================  Functions for the football match simulator  ================

// Change teams on League Select change 
function changeLeague(select) {
    let $leagueSelect = $(select)
    let league = $leagueSelect.children('option:selected').val();
    switch (league) {
        case 'epl':
            dict = EPL;
            team1ToSelect = 'Manchester_United';
            team2ToSelect = 'Manchester_City';
            break;
        case 'bundesliga':
            dict = BL;
            team1ToSelect = 'Bayern';
            team2ToSelect = 'Dortmund';
            break;
        case 'serie_a':
            dict = SA;
            team1ToSelect = 'Inter_Milan';
            team2ToSelect = 'Juventus';
            break;
        case 'la_liga':
            dict = LL;
            team1ToSelect = 'Real_Madrid';
            team2ToSelect = 'Barcelona';
            break;
        case 'ligue_1':
            dict = L1;
            team1ToSelect = 'PSG';
            team2ToSelect = 'Lyon';
    }
    // Create string of HTML options and append to select
    var keys = Object.keys(dict);
    keys.sort();
    var options = '';
    for (let i = 0; i < keys.length; i++) {
        options += `<option value='${dict[keys[i]]}'>${keys[i]}</option>`;
    }
    let teamNum = $leagueSelect[0].id.charAt(7);
    $(`#teams${teamNum}`).html(options);
    // Toggle selected/disable attributes
    toggleDisable(league, teamNum, team1ToSelect, team2ToSelect);
}

// Toggle selected/disabled on team change
function changeTeam(select) {
    let $teamSelect = $(select)
    let teamNum = $teamSelect[0].id.charAt(5);
    let selectedTeam = $teamSelect.children('option:selected').val();
    if (teamNum == 1) {
        var oppTeamNum = 2;
    } else if (teamNum == 2) {
        var oppTeamNum = 1;
    }
    $(`#teams${oppTeamNum} option[value='${selectedTeam}']`).prop('disabled', true).siblings().prop('disabled', false);
}

// Toggle selected / disabled attributes when league is changed
function toggleDisable(league, teamNum, team1ToSelect, team2ToSelect) {
    if (teamNum == 1) {
        var oppTeamNum = 2;
        var toSelect = team1ToSelect;
    } else if (teamNum == 2) {
        var oppTeamNum = 1;
        var toSelect = team2ToSelect;
    }
    // If Leagues are same, disable same-team matchup ; Change default selected team if already selected for opp. team
    if ($(`#leagues${oppTeamNum} option:selected`).val() == league) {
        let oppSelected = $(`#teams${oppTeamNum} option:selected`).val();
        if (oppSelected == toSelect) {
            if (teamNum == 1) {
                toSelect = team2ToSelect;
            } else if (teamNum == 2) {
                toSelect = team1ToSelect;
            }
        }
        $(`#teams${oppTeamNum} option[value=${toSelect}]`).prop('disabled', true);
        $(`#teams${teamNum} option[value=${oppSelected}]`).prop('disabled', true);
    } else {
        $(`#teams${oppTeamNum}`).children().prop('disabled', false);
    }
    $(`#teams${teamNum} option[value=${toSelect}]`).prop('selected', true);
}

// Append results from AJAX - match results & events 
function appendResults(team1, team2, match_events) {
    $('.team1-name').append(team1[0]);
    $('.team2-name').append(team2[0]);
    $('.team1-score').append(team1[1]);
    $('.team2-score').append(team2[1]);
    const $cardBody = $('.results-card-body');
    let n = 0;
    for (i in match_events) {
        switch (match_events[i][2]) {
            case 'G':
                event = `<i class='fas fa-futbol'></i>`;
                break;
            case 'R':
                event = `<div class='red-card'></div>`;
        };
        if (match_events[i][3] == team1[0]) {
            $cardBody.append(`<div class='row events-row'><div class='col-4 events team1-event-name'>${match_events[i][0]}</div><div class='col text-nowrap events team1-event-min'>${match_events[i][1]}</div><div class='col-1 events team1-event-type'>${event}</div><div class='col-6'></div></div>`);

        } else if (match_events[i][3] == team2[0]) {
            $cardBody.append(`<div class='row events-row'><div class='col-6'></div><div class='col-1 events team2-event-type'>${event}</div><div class='col text-nowrap events team2-event-min'>${match_events[i][1]}</div><div class='col-4 events team2-event-name'>${match_events[i][0]}</div></div>`);
        };
        n += 1;
    }
    if (n === 0) {
        $cardBody.addClass('hide-body');
    }
}

// Change button text, (90 x 15ms) + 300ms buffer
function changeBtnText() {
    return new Promise(res => {
        let i = 1;
        const simBtn = $('.sim-button')[0];
        let btnTimer = setTimeout(run = () => {
            simBtn.innerHTML = `simulating – ${i++}'`;
            btnTimer = setTimeout(run, 15);
            if (i > 90) {
                clearTimeout(btnTimer);
                setTimeout(res, 300);
            }
        }, 15);
    });
}

// Make AJAX request and append results 
function ajaxRequest() {
    return new Promise((res, rej) => {
        let thisURL = $('.footballForm').attr('data-url') || window.location.href;
        let team1 = $('#teams1').val();
        let team2 = $('#teams2').val();
        $.ajax({
                method: 'GET',
                url: thisURL,
                data: {
                    app: 'match_sim',
                    team1: team1,
                    team2: team2
                }
            })
            .done(response => {
                appendResults(response.team1, response.team2, response.match_events);
                res('success');
            })
            .fail((jqXHR, exception) => {
                rej(handleAjaxError(jqXHR, exception));
            });
    });
}

// Call button change and AJAX request - then handle results
function simMain() {
    const promises = [changeBtnText(), ajaxRequest()];
    Promise.allSettled(promises).then((results) => {
        if (results[1].status === 'fulfilled') {
            $('.football-carousel').carousel('next');
        } else if (results[1].status === 'rejected') {
            $('.sim-button').text('simulate').prop('disabled', false);
            alert(results[1].reason);
        }
    });
}

// =============  Event listeners  =============

$(document).ready(function() {

    // Change league selects
    $('#leagues1, #leagues2').change(function() {
        changeLeague(this);
    });

    // Trigger change to populate teams
    $('#leagues1, #leagues2').trigger('change');

    // Change team selects
    $('#teams1, #teams2').change(function() {
        changeTeam(this);
    });

    // On carousel slide - animate height change of carousel
    $('.football-carousel').on('slide.bs.carousel', function(e) {
        animateCrsl($('.carousel-item.active'), $(e.relatedTarget));
    });

    // After carousel slide (Reset 'simulating...' button / remove match results)
    $('.football-carousel').on('slid.bs.carousel', function(e) {
        if (e.from === 0) {
            $('.sim-button').text('simulate').prop('disabled', false);
        } else if (e.from === 1) {
            $('.events-row').remove();
            $('.team1-name, .team2-name, .team1-score, .team2-score').empty();
            $('.results-card-body').removeClass('hide-body');
        }
    });

    // Reset button
    $('.reset-btn').click(function() {
        $('.football-carousel').carousel('next');
    });

    // Main form submission
    $('.footballForm').submit(function(e) {
        e.preventDefault();
        $('.sim-button').prop('disabled', true);
        simMain();
    });

});