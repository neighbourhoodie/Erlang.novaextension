
unquoted() ->
    a,
    foo,
    my_thing2,
    myThing2,
    foo@bar.

quoted() ->
    '$initial_call',
    '0123',
    'GET',
    'foo\nbar'.

invalid() ->
    'foo\qbar'.