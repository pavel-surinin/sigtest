# SigTest documentation plan

  - [Overview aka What is it and what's it for](#overview-aka-what-is-it-and-whats-it-for)
    - [Library features](#library-features)
    - [You can need it when you](#you-can-need-it-when-you)
    - [What it **doesn't** do (PR's are welcome)](#what-it-doesnt-do-prs-are-welcome)
  - [Configuration](#configuration)
  - [Usage](#usage)
  - [Reference aka How it works](#reference-aka-how-it-works)
    - [Testing flow](#testing-flow)
    - [Supported nodes](#supported-nodes)
    - [Comparators](#comparators)
    - [Error codes](#error-codes)

## Overview aka What is it and what's it for


This library can compare TypeScript npm package exported file members for backwards compatibility.
Also it can generate reports (changelogs) and generate migration scripts (not all cases)
when code changes braked backwards compatibility.

### Library features
 - check TypeScript code for backwards compatibility
 - generate changelog
 - provide migration scripts

### You can need it when you
 - care about npm module backwards compatibility.
 - want to test your library and know what version to bump patch or minor.
 - want to have generated changelog in each version change.


### What it **doesn't** do (PR's are welcome)
 - does not fully support TypeScript `type` aliases comparison

## Configuration

## Usage

## Reference aka How it works

### Testing flow
The diagram goes here.

### Supported nodes

### Comparators

Checker or comparator? Need to disambiguate and use one term

### Error codes
