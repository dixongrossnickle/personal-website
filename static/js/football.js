// ================  Functions for the football match simulator  ================

// Change teams on League Select change 
function changeLeague(select) {
    let $leagueSelect = $(select)
    let league = $leagueSelect.children('option:selected').val();
    switch (league) {
        case 'E1':
            dict = england;
            defaultSelect1 = 'E10';
            defaultSelect2 = 'E116';
            break;
        case 'G1':
            dict = germany;
            defaultSelect1 = 'G12';
            defaultSelect2 = 'G13';
            break;
        case 'I1':
            dict = italy;
            defaultSelect1 = 'I18';
            defaultSelect2 = 'I19';
            break;
        case 'S1':
            dict = spain;
            defaultSelect1 = 'S13';
            defaultSelect2 = 'S114';
            break;
        case 'F1':
            dict = france;
            defaultSelect1 = 'F114';
            defaultSelect2 = 'F16';
    }
    // Create string of HTML options and append to select
    var options = '';
    for (teamID in dict) {
        options += `<option value='${teamID}'>${dict[teamID]}</option>`;
    }
    let teamNum = $leagueSelect[0].id.charAt(7);
    $(`#teams${teamNum}`).html(options);
    // Toggle selected/disable attributes
    selectAndDisable(league, teamNum, defaultSelect1, defaultSelect2);
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
function selectAndDisable(league, teamNum, team1ToSelect, team2ToSelect) {
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
function appendResults(results, homeTeam, awayTeam, matchEvents) {
    $('.team1-name').append(homeTeam.name);
    $('.team2-name').append(awayTeam.name);
    $('.team1-score').append(results.homeTeamGoals);
    $('.team2-score').append(results.awayTeamGoals);
    const $cardBody = $('.results-card-body');
    let i = 0;
    for (min in matchEvents) {
        switch (matchEvents[min].event) {
            case 'goal':
                eventHTML = `<i class='fas fa-futbol'></i>`;
                break;
            case 'red card':
                eventHTML = `<div class='red-card'></div>`;
        }
        if (matchEvents[min].team == homeTeam.name) {
            $cardBody.append(`<div class='row events-row'><div class='col-4 events team1-event-name'>${matchEvents[min].player}</div><div class='col text-nowrap events team1-event-min'>${`${min}'`}</div><div class='col-1 events team1-event-type'>${eventHTML}</div><div class='col-6'></div></div>`);

        } else if (matchEvents[min].team == awayTeam.name) {
            $cardBody.append(`<div class='row events-row'><div class='col-6'></div><div class='col-1 events team2-event-type'>${eventHTML}</div><div class='col text-nowrap events team2-event-min'>${`${min}'`}</div><div class='col-4 events team2-event-name'>${matchEvents[min].player}</div></div>`);
        }
        i+=1;
    }
    if (i === 0) {
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
const $footballForm = $('.footballForm')
function ajaxRequest() {
    return new Promise((res, rej) => {
        let thisURL = `${$footballForm.attr('data-url')}${$footballForm.attr('action')}`;
        let team1Val = $('#teams1').val();
        let team2Val = $('#teams2').val();
        $.ajax({
                method: 'GET',
                url: thisURL,
                data: {
                    home: team1Val,
                    away: team2Val
                }
            })
            .done(response => {
                appendResults(response.result, response.homeTeam, response.awayTeam, response.matchEvents);
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