from mysite.settings import SOCCER_CSV_DIR
import pandas

# Read Football files
with open(SOCCER_CSV_DIR + 'matches_20.csv') as f:
    MATCH_DF = pandas.read_csv(f)
with open(SOCCER_CSV_DIR + 'players_20.csv') as f:
    FIFA_DF = pandas.read_csv(f)
