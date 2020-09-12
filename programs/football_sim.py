import random as rnd
from . import MATCH_DF, FIFA_DF


class Player:

    def __init__(self, team_name, name, position, scoring, aggression):
        self.team_name = str(team_name)
        self.name = str(name)
        self.position = str(position)
        self.scoring = int(scoring)
        self.aggression = int(aggression)
        self.match_stats = {}

# -----------------------------------------------------------------------------

class Team:

    def __init__(self, team_name, is_home):
        self.name = team_name
        self.is_home = is_home
        self.populate_roster()
        self.append_probs()
        self.calc_goals()

    # --- Calculate means and SD's of goals for & against
    def calc_goals(self):
        if self.is_home:
            df = MATCH_DF[MATCH_DF['HomeTeam'] == self.name]
            self.mean_GF = df.FTHG.mean()
            self.std_GF = df.FTHG.std()
            self.mean_GA = df.FTAG.mean()
            self.std_GA = df.FTAG.std()
        else:
            df = MATCH_DF[MATCH_DF['AwayTeam'] == self.name]
            self.mean_GF = df.FTAG.mean()
            self.std_GF = df.FTAG.std()
            self.mean_GA = df.FTHG.mean()
            self.std_GA = df.FTHG.std()

    # --- Populate roster with Players (separated by position)
    def populate_roster(self):
        # Create new dataframe for specific team; Drop subs, reserves, and GKs
        df = FIFA_DF.loc[FIFA_DF['club'] == self.name, ['club', 'short_name', 'team_position', 'shooting', 'mentality_aggression']]
        df = df[~df['team_position'].isin(['SUB','RES','GK'])].reset_index(drop=True)
        # Create player instance for each player on roster; add position-based multipliers
        self.roster = []
        for i in range(len(df)):
            player = Player(df.iloc[i,0], df.iloc[i,1], df.iloc[i,2], df.iloc[i,3], df.iloc[i,4])
            if player.position in ('ST','RS','LS','CF','LF','RF'):
                player.scoring *= 3
            elif player.position in ('RW','LW'):
                player.scoring *= 2.5
            elif player.position in ('RM','LM','CAM'):
                player.scoring *= 2
            elif player.position in ('CB','RCB','LCB','LB','RB','CDM','RDM','LDM'):
                player.scoring *= 0.6
                player.aggression *= 2
            self.roster.append(player)

    # --- Add player probabilities to team's probabilities list
    def append_probs(self):
        self.probs = [[],[]]
        for player in self.roster:
            self.probs[0].append(player.scoring)
            self.probs[1].append(player.aggression)

# -----------------------------------------------------------------------------

class MatchUp:

    def __init__(self, Team1, Team2):
        self.Team1 = Team1
        self.Team2 = Team2
        self.events = {}
        self.results = {}

    # --- Simulate single game
    """
    Number of goals: a random value from the gaussian distributions of 
    each team's goals, rounded to the nearest int. 
    A team's goals are calculated by averaging the values for a 
    team's goals for and its opponent's goals conceded.
    """
    def sim(self):
        events_list = [] 
        team1_goals = int(round((rnd.gauss(self.Team1.mean_GF,self.Team1.std_GF) + rnd.gauss(self.Team2.mean_GA,self.Team2.std_GA)) / 2))
        events_list.append(team1_goals) #[0] - Append team 1 goals
        team2_goals = int(round((rnd.gauss(self.Team2.mean_GF,self.Team2.std_GF) + rnd.gauss(self.Team1.mean_GA,self.Team1.std_GA)) / 2))
        events_list.append(team2_goals) #[1] - Append team 2 goals

        # Weighted selection for red cards (prob's remain the same each time)
        red_cards = rnd.choices((0,1), weights=[0.96, 0.04], k=2)
        events_list.append(red_cards[0])
        events_list.append(red_cards[1])

        # Set neg. number to 0 (may occur due to avg. of goals scored + goals against)
        for i in range(4):
            if events_list[i] < 0:
                events_list[i] = 0

        # Update match results dictionary
        self.results.update({'team1': events_list[0], 'team2': events_list[1]})

        #Possible minutes for match events
        poss_mins = list(range(2,95))
        # Call method to assign players to events (either goal or red card)
        self.assign_events(self.Team1, events_list[0], events_list[2], poss_mins)
        self.assign_events(self.Team2, events_list[1], events_list[3], poss_mins)

    # --- Choose weighted random choice from roster to determine match events
    def assign_events(self, Team, goals, reds, poss_mins):
        for _ in range(goals):
            player = rnd.choices(Team.roster, weights=Team.probs[0], k=1)[0]
            minute = rnd.choice(poss_mins)
            while minute-1 in self.events or minute+1 in self.events:
                poss_mins.remove(minute)
                minute = rnd.choice(poss_mins)
            poss_mins.remove(minute)
            player.match_stats[minute] = 'GOAL'
            self.events[minute] = [Team.name, 'G', player.name]

        for _ in range(reds):
            player = rnd.choices(Team.roster, weights=Team.probs[1], k=1)[0]
            minute = rnd.choice(poss_mins)
            # Cannot get red card before a goal (if they have a goal in their performance) - assign a new minute
            if len(player.match_stats) > 0:
                most_recent_event = max(player.match_stats.keys())
                i = 0
                while minute <= most_recent_event or minute-1 in self.events or minute+1 in self.events:
                    minute = rnd.choice(poss_mins)
                    i += 1
                    if i > 100: # Prevents infinite loop if players scored in the last minutes
                        minute = 96
                        poss_mins.append(96)
            poss_mins.remove(minute)
            # Append event to match-up dictionary, remove player (& prob.) in case of second red card
            self.events[minute] = [Team.name, 'R', player.name]
            Team.roster.remove(player)
            Team.probs[1].remove(player.aggression)
