from django.http import JsonResponse
from .football_sim.team import Team
from .football_sim.matchup import MatchUp
# Import email
from mysite.settings import DEBUG, EMAIL_HOST_USER
from django.core.mail import send_mail

# Sim match and return JSON Response
def match_sim(request):
    try:
        # Get team names
        home_team_id = request.GET['home']
        away_team_id = request.GET['away']
        #Create Team objects
        HomeTeam = ''
        AwayTeam = ''
        HomeTeam = Team(home_team_id, 'home')
        AwayTeam = Team(away_team_id, 'away')
        # Create matchup instance & sim
        Match = MatchUp(HomeTeam, AwayTeam)
        Match.sim()
        # Return results
        response = JsonResponse({
            'result': Match.results,
            'homeTeam': {
                'name': HomeTeam.club_name,
                'startingXI': HomeTeam.starting_XI
            },
            'awayTeam': {
                'name': AwayTeam.club_name,
                'startingXI': AwayTeam.starting_XI
            },
            'matchEvents': Match.events
        }, status=200)
        response['Access-Control-Allow-Origin'] = '*'
        return response
    
    except KeyError:
        return handle_error('KeyError', request, away_team_id, HomeTeam, AwayTeam)
    except AttributeError:
        return handle_error('AttributeError', request, away_team_id, HomeTeam, AwayTeam)
    except:
        return handle_error('Other', request, away_team_id, HomeTeam, AwayTeam)


# Return appropriate error response
def handle_error(error, request, away_id, HomeTeam, AwayTeam):
    if error == 'KeyError':
        submsg1 = ''
        submsg2 = ''
        if HomeTeam != '':
            submsg1 += f'  [FOUND: {HomeTeam.club_name}]'
        else:
            try:
                AwayTeam = Team(away_id, 'away')
                submsg2 += f'  [FOUND: {AwayTeam.club_name}]'
            except KeyError:
                pass
        message = "\nKEY ERROR — Could not find one or both teams. The URL variables "\
            +f"given were:\n\nhome:  {request.GET['home']}{submsg1}\n\naway:  {request.GET['away']}{submsg2}\n"\
            +"\nVisit https://github.com/dixongrossnickle/personal-website and make sure variables "\
            +"in your url match the values in the README documentation exactly.\n"
    else:
        message = "\nUNKNOWN ERROR — An unknown error occurred during simulation. I've been notified and will fix it soon.\n"
    if DEBUG == False:
        subject = 'Simulator – Internal Server Error'
        send_mail(subject, message, EMAIL_HOST_USER, ['dixon.grossnickle@gmail.com'])
    response =  JsonResponse({
        'status': 'Internal Server Error',
        'message': message
    }, status=500)
    response['Access-Control-Allow-Origin'] = '*'
    return response
