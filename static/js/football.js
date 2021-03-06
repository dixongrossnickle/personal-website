// ================  Functions for the football match simulator  ================
const RESULTS_CARD = '<div class="card results-card"><div class="card-header results-card-header"><div class="row score-row"><div class="col team1-name-col"><h5 class="team1-name m-0"></h5></div><div class="col-auto goals1-col p-0"><h5 class="score team1-score m-0"></h5></div><div class="col-auto dash-col"><h5 class="score dash m-0">-</h5></div><div class="col-auto goals2-col p-0"><h5 class="score team2-score m-0"></h5></div><div class="col team2-name-col text-right"><h5 class="team2-name m-0"></h5></div></div></div><div class="card-body results-card-body"></div></div>';

// Handle AJAX request error
function handleAjaxError(jqXHR, exception) {
   try {
      var responseMsg = `\n\n${jqXHR.responseJSON.message}`;
   } catch {
      var responseMsg = '';
   }
   let errorMsg = '';
   if (jqXHR.status == 0) {
      errorMsg = 'Could not connect to server. Please check your network connection.';
   } else if (jqXHR.status == 403) {
      errorMsg = 'Forbidden - CSRF verification failed [403].';
   } else if (jqXHR.status == 404) {
      errorMsg = 'Requested page not found [404].';
   } else if (jqXHR.status == 500) {
      errorMsg = 'Internal server error [500].';
   } else if (exception == 'parsererror') {
      errorMsg = 'Requested JSON parse failed.';
   } else if (exception == 'timeout') {
      errorMsg = 'Request timed out.';
   } else if (exception == 'abort') {
      errorMsg = 'AJAX request aborted.';
   } else {
      errorMsg = `Uncaught exception:\n${jqXHR.responseText}`;
   }
   return `${errorMsg}${responseMsg}`;
}

// Animate height change of carousel-inner
function animateCarousel(event) {
   let $active = $('.carousel-item.active');
   let $tgt = $(event.relatedTarget);
   let thisHt = $active.outerHeight();
   let nextHt = $tgt.outerHeight();
   let defaultHt = $('.form-item').outerHeight();
   if (nextHt > thisHt && event.from == 0) {
      $tgt.parent().animate({
         height: nextHt
      }, 600);
   } else if (nextHt < thisHt && event.from == 1) {
      $tgt.parent().animate({
         height: nextHt
      }, 600);
   } else {
      $tgt.parent().animate({
         height: defaultHt
      }, 200);
   }
}

// Update variables to reflect the most recently selected teams
var lastSelectedTeam1;
var lastSelectedTeam2;

function updateLastSelected() {
   lastSelectedTeam1 = $('#teams1 option:selected').val();
   lastSelectedTeam2 = $('#teams2 option:selected').val();
}

// Toggle selected / disabled attributes when league is changed
function selectDefaultTeams(teamNum, team1ToSelect, team2ToSelect) {
   switch (teamNum) {
      case '1':
         oppTeamNum = '2',
         toSelect = team1ToSelect;
         break;
      case '2':
         oppTeamNum = '1',
         toSelect = team2ToSelect;
   }
   if ($(`#teams${oppTeamNum} option:selected`).val() == toSelect) {
      if (teamNum == '1') {
         toSelect = team2ToSelect;
      } else if (teamNum == '2') {
         toSelect = team1ToSelect;
      }
   }
   $(`#teams${teamNum} option[value=${toSelect}]`).prop('selected', true);
}

// Change teams on League Select change 
function changeLeague(leagueSelect) {
   let league = leagueSelect.value;
   switch (league) {
      case 'E1':
         teams = england,
         defaultSelect1 = 'E10',
         defaultSelect2 = 'E116';
         break;
      case 'G1':
         teams = germany,
         defaultSelect1 = 'G12',
         defaultSelect2 = 'G13';
         break;
      case 'I1':
         teams = italy,
         defaultSelect1 = 'I18',
         defaultSelect2 = 'I19';
         break;
      case 'S1':
         teams = spain,
         defaultSelect1 = 'S13',
         defaultSelect2 = 'S114';
         break;
      case 'F1':
         teams = france,
         defaultSelect1 = 'F114',
         defaultSelect2 = 'F16';
   }
   // Create string of HTML options and append to select
   let options = '';
   for (teamID in teams) {
      options += `<option value='${teamID}'>${teams[teamID]}</option>`;
   }
   let teamNum = leagueSelect.id.charAt(7);
   $(`#teams${teamNum}`).html(options);
   // Select default teams / prevent same-team selection
   selectDefaultTeams(teamNum, defaultSelect1, defaultSelect2);
}

// Switch selected teams if team is already selected
function changeTeam(teamSelect) {
   let teamNum = teamSelect.id.charAt(5);
   switch (teamNum) {
      case '1':
         oppTeamNum = '2',
         lastSelected = lastSelectedTeam1;
         break;
      case '2':
         oppTeamNum = '1',
         lastSelected = lastSelectedTeam2;
   }
   if ($(`#teams${teamNum} option:selected`).val() == $(`#teams${oppTeamNum} option:selected`).val()) {
      $(`#teams${oppTeamNum} option[value='${lastSelected}']`).prop('selected', true);
   }
}

// Append results from AJAX - match results & events 
function appendResults(results, homeTeam, awayTeam, matchEvents) {
   $('.team1-score').append(results.homeTeamGoals);
   $('.team2-score').append(results.awayTeamGoals);
   $('.team1-name').append(homeTeam.name);
   $('.team2-name').append(awayTeam.name);
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
         $cardBody.append(`<div class='row events-row align-items-center'><div class='col-4 events team1-event-name'>${matchEvents[min].player}</div><div class='col text-nowrap events team1-event-min text-right'>${`${min}'`}</div><div class='col-1 events team1-event-type p-0 text-center'>${eventHTML}</div><div class='col-6'></div></div>`);

      } else if (matchEvents[min].team == awayTeam.name) {
         $cardBody.append(`<div class='row events-row align-items-center'><div class='col-6'></div><div class='col-1 events team2-event-type p-0 text-center'>${eventHTML}</div><div class='col text-nowrap events team2-event-min'>${`${min}'`}</div><div class='col-4 events team2-event-name text-right'>${matchEvents[min].player}</div></div>`);
      }
      i += 1;
   }
   if (i == 0) {
      $cardBody.addClass('hide-body');
   }
}

// Change button text, (90 x 15ms) + 300ms buffer
function changeBtnText() {
   $('.sim-button').prop('disabled', true);
   return new Promise(res => {
      let i = 1;
      const simBtn = $('.sim-button')[0];
      btnTimer = setTimeout(run = () => {
         simBtn.value = `simulating – ${i++}'`;
         btnTimer = setTimeout(run, 15);
         if (i > 90) {
            clearTimeout(btnTimer);
            setTimeout(res, 300);
         }
      }, 15);
   });
}

// Make AJAX request and append results
const $footballForm = $('.footballForm');
function ajaxRequest() {
   return new Promise((res, rej) => {
      let thisURL = $footballForm.attr('data-url');
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
            res();
         })
         .fail((jqXHR, exception) => {
            rej(handleAjaxError(jqXHR, exception));
            clearTimeout(btnTimer);
         });
   });
}

// Call button change and AJAX request - then either show results or error message
function simMain() {
   const promises = [changeBtnText(), ajaxRequest()];
   Promise.all(promises).then(
      () => {
         $('.football-carousel').carousel('next');
      },
      (reason) => {
         console.log(`\n${reason}\n\n`)
         $('.sim-button').val('simulate').prop('disabled', false);
         alert(`${reason}\n\nSee console for details.`);
      }
   );
}

// =============  Event listeners  =============

$(document).ready(function() {
   // Change league selects
   $('#leagues1, #leagues2').change(function() {
      changeLeague(this);
      updateLastSelected();
   });

   // Change team selects
   $('#teams1, #teams2').change(function() {
      changeTeam(this);
      updateLastSelected();
   });

   // On carousel slide - animate height change of carousel
   $('.football-carousel').on('slide.bs.carousel', function(e) {
      animateCarousel(e);
   });

   // After carousel slide (Reset 'simulating...' button / remove & replace results card)
   $('.football-carousel').on('slid.bs.carousel', function(e) {
      if (e.from == 0) {
         $('.sim-button').val('simulate').prop('disabled', false);
      } else if (e.from == 1) {
         $('.results-card').remove();
         $('.results-container').prepend(RESULTS_CARD);
      }
   });

   // Reset button
   $('.reset-btn').click(function() {
      $('.football-carousel').carousel('next');
   });

   // Main form submission
   $('.footballForm').submit(function(e) {
      e.preventDefault();
      simMain();
   });

   // Correct heights of .carousel-inner's to prevent overflow issues
   $(window).on('orientationchange', function() {
      $('.carousel-inner').removeAttr('style');
   });

   // Trigger changes for league select and update last selected variables
   $('#leagues1, #leagues2').trigger('change');
   updateLastSelected();

   // Prepend results card
   $('.results-container').prepend(RESULTS_CARD);

   // Initialize carousel
   $('.football-carousel').carousel({
      interval: false,
      keyboard: false,
      pause: false,
      touch: false
   });

});
