
foo(#st{foo = 2} = MySt) ->
    MySt#st{foo = 3}.


bar(#acc{} = Acc) ->
    #acc{
        f1 = MyF1,
        f3 = MyF3
    } = Acc,
    Acc#acc{
        thing = 2,
        blue = Acc
    }.

baz(#acc{} = Acc) ->
    Acc#acc.count.
