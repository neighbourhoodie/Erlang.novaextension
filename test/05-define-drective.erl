-define(SINGLE_VALUE, bar).

-define(EXPRESSION, bar andalso foo).

-define(LIST_CONSTANT, [
    a,
    b,
    c
]).

-define(MAP_CONSTANT, #{
    a => b,
    c => d
}).

-define(MACRO1(Arg1, Arg2), mod:fun(Arg1, Arg2 + 3)).

-define(MACRO2(Arg1, Arg2), begin
    do_thing_with(Arg1),
    Arg2 orelse other_thing(Arg1)
end).