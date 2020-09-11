from django.shortcuts import render
from django.http import JsonResponse
from programs.apps.football_sim import Team, MatchUp
# Import email
from mysite.settings import DEBUG, EMAIL_HOST_USER
from django.core.mail import send_mail

def index(request):
    # If AJAX, run app and return JSON
    if request.is_ajax():
        try:
            # Get team names and replace '_'
            team1_name = request.GET.get('team1').replace('_', ' ')
            team2_name = request.GET.get('team2').replace('_', ' ')
            #Create Team objects
            team1 = Team(team1_name, True)
            team2 = Team(team2_name, False)
            # Create matchup
            matchup = MatchUp(team1, team2)
            # Sim match
            matchup.sim()
            team1_goals = matchup.results['team1']
            team2_goals = matchup.results['team2']
            # Matchup.events format: name, minute, event, team name
            match_events = []
            for i in sorted(matchup.events, key=int):
                match_events.append([matchup.events[i][2], str(i)+"'", matchup.events[i][1], matchup.events[i][0]])
            return JsonResponse({
                'team1': [team1_name, team1_goals],
                'team2': [team2_name, team2_goals],
                'match_events': match_events
            }, status=200)
        except:
            if DEBUG == False:
                subject = 'Internal Server Error [500]'
                message = f"An internal server error occurred during handling of the Football Sim app. The request context was:\n\n{request.POST.get('team1')}\n{request.POST.get('team2')}"
                send_mail(subject, message, EMAIL_HOST_USER, ['dixon.grossnickle@gmail.com'])
                return JsonResponse({'status': 'Internal Server Error'}, status=500)
            else:
                pass

    # Render main template
    else:
        response = render(request, 'index.html')
        response['Strict-Transport-Security'] = 'max-age=15768000; includeSubDomains'
        return response
