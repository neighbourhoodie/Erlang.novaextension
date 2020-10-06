foo() -> ok.
foo() ->
    ok.


foo(Arg) ->
    Arg + 1.


foo(Arg1, Arg2, Arg3) ->
    Arg1 * Arg2 - Arg3.


bar(2) ->
    2 * 5;
bar(10) ->
    10 - 5;
bar(Other) ->
    Other * Other.


bam(#st{foo = 1} = MySt) ->
    {ok, MySt#st{foo = 2}}.


another(Arg) when is_integer(Arg) -> integer;
another(Arg) when is_list(Arg) -> list.


combos(Arg) when is_integer(Arg), Arg > 0 -> ok.

combos(Arg) when is_integer(Arg); is_float(Arg) -> ok.
