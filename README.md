***
## [https://dixongrossnickle.com](https://dixongrossnickle.com)
***
<br/>

# Backstory
This website has been a full stack learning project that started with the [football match simulator](https://github.com/dixongrossnickle/personal-website/blob/master/programs/football_sim/). This was one of my first Python programs, and I decided I wanted to build a front end for it and host it online — this led me to Django, which required a brief detour into HTML, CSS, and JavaScript. By the time I published the first version, I had a much better understanding of the entire stack. This past summer, I spent some of time learning about Bootstrap and JavaScript, and I decided to redesign the layout and add asynchronous features.<br/><br/>

## JavaScript
The webpages themselves rely heavily on JavaScript. When the *simulate* button is clicked, a jQuery AJAX request is sent to the server, where the simulation runs. Then, the results are appended to the page right before the Bootstrap carousel slides to show the match summary. A number of other site features make use of the jQuery and Bootstrap libraries as well.<br/>

JavaScript code can be found under [static/js/](https://github.com/dixongrossnickle/personal-website/blob/master/static/js/).<br/><br/>

## Django
I know this site could've easily been handled by something light-weight such as Flask; I just wanted to get familiar with Django because I think it's fantastic. Also, the Django stack used here is very light-weight — it only has a few middlewares since there's no database or user authentication.<br/><br/>
All custom static files are served by [whitenoise](http://whitenoise.evans.io/en/stable/index.html), which is a middleware that compresses files, creates versioned URLs, and sets appropriate cache headers.<br/>

The Django app is served by [Gunicorn](https://docs.gunicorn.org/en/stable/) with [Nginx](https://nginx.org/en/) as a reverse proxy.<br/><br/><br/>

# Football Simulator
The football simulator uses [pandas](https://pypi.org/project/pandas/) to read two CSV's: one containing every match from Europe's top 5 leagues (2019-20 season), and another containing the all players' ratings from the FIFA 20 video game. It finds the mean and standard deviation of each team's goals for & goals conceded, depending on home or away matches. Then, it creates Gaussian distributions for each, and averages the two to determine the goals scored by each team.<br/><br/>

The simulator can be used via a web API — see [football-simulator](https://github.com/dixongrossnickle/football-simulator/) for more details.
