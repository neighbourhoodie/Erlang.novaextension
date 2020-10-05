foo() ->
    #{foo => bar},
    #{
        foo => bar,
        1 => "stuff",
        self() => erlang:make_ref()
    }.


bar(#{key := baz} = Stuff) ->
    #{
        pid := Bar,
        1 := More
    } = Stuff,
    Stuff#{
        pid := self(),
        1 := "twelve"
    }.
