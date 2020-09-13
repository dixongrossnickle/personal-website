class Player:

    def __init__(self, name, club_name, position, finishing, aggression):
        self.name = str(name)
        self.club_name = str(club_name)
        self.position = str(position)
        self.finishing = int(finishing)
        self.aggression = int(aggression)
        self.match_stats = {}

    def get_attributes(self):
        return {
            'name': self.name,
            'clubName': self.club_name,
            'position': self.position,
            'finishing': self.finishing,
            'aggression': self.aggression,
        }
