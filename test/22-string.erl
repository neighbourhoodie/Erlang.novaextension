
valid() ->
    "foo",
    "foo ~p bar",
    "foo\nbar\n".

invalid() ->
    "foo\qbar",
    "~".
