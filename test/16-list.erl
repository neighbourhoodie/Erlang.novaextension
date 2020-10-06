
a_list() ->
    [a, b, 1.0, "stuff"].

a_vertical_list() ->
    [
        a,
        b,
        1.0,
        "stuff"
    ].

prepend_list(Arg) ->
    [a | Arg]

a_list_comp() ->
    [Seq * 2 || Seq <- lists:seq(1, 10)].
