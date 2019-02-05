# Mini Web CTF

## Overview

These problems were originally designed as part of a Women's CTF hosted by the [Plaid Parliament of Pwning](http://pwning.net) and Carnegie Mellon's [Information Networking Institute](https://www.cmu.edu/ini/). The project was intended for absolute beginners, although a basic amount of programming or networking knowledge helps.

Topics covered in this CTF include SQL injection, cross site scripting, client side authentication, and server-side logic errors. 

Accompanying the problems are the [following slides](https://docs.google.com/presentation/d/1G5Ewk8WNRLxkbywhBARiMco8rXBW6LInJB2Hi-0FvbQ/edit?usp=sharing). In addition, there is a small application ([/intro](https://github.com/zwade/minictf/tree/master/intro)) that is designed to be played along with the presentation.

## Setup

All of the problems are designed to be run inside of docker, although they can be run locally. To run the problems inside of docker, you will need the [docker daemon](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/). Once you have them both installed, run

1. `make`
2. `docker-compose up -d`

This will start all of the problems with ports exposed to the local machine. 

#### Note 

Starting the problems will not start any kind of problem management interface. Although this is not included within the scope of this project, we recommend using the [Pico platform](https://github.com/picoCTF/picoCTF) for competition and problem management. 

## Problems

Once you've built and started the problems, the problems will be found on the following ports

Problem Name | Port
-------------------
Intro | 8000
Postable | 7070
Trackr | 7654
We Rate Birds | 9630
Can I Have Flag | 5454 
BagelShop | 7007
Word-Lock | 1337
JsSafe | 2266

## Solutions

Most problems don't have solve scripts, although a couple of them (such as `canihaveflag`) do.

## Credits

All problems were designed and written by Zach Wade (@zwade) and Carolina Zarate (@zaratec).

The competition was sponsored by the Plaid Parliament of Pwning and CMU Information Networking Institute.

## Contributions

This project is intended to be used as a standalone, complete repository. If you have issues with it or bug fixes, feel free to issue a PR and we will get them merged in. If you have additional problems that you would like added, let us know and we can see if it's appropriate.