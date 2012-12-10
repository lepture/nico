# Contributing

There are more than one way to contribute, and I will appreciate any way you choose.

- tell your friends about nico, let nico to be known
- discuss nico, and submit bugs with github issues
- send patch with github pull request

English and Chinsese issuses are acceptable, but English is prefered.

Pull request and git commit message only accept English, if your commit message is in other language, it will be rejected.


## Codebase

The codebase of nico is highly tested and linted, as a way to guarantee functionality and keep all code written in a particular style for readability.

You should follow the code style, and if you add any code, please add test case.

A little hint to make things simple:

- when you cloned this repo, run ``make``, it will prepare everything for you
- check the code style with ``make lint``
- check the test case with ``make test``

If you are on Windows, please have a look at Makefile and find out what should be done.


## Git Help

Something you should know about git.

- don't add any code on the master branch, create a new one
- don't add too many code in one pull request, you can't add too many features in one pull request

Hint of git:

```
$ git branch [featurename]
$ git checkout [featurename]
```
