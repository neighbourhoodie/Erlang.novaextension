
-define(FOO, foo).
-define(BAR(Arg1), Arg1 + 2).

is_foo(Arg) ->
    Arg == ?FOO.


call_bar(Arg) ->
    ?BAR(Arg) + 3.
