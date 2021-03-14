#!/usr/bin/env bash

exec tee $2 | $1 -l debug | tee $3