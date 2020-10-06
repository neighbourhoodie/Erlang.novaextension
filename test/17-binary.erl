
foo() ->
    <<"this is a binary">>.

bar() ->
    <<1, 2, 4, 128, "also a binary">>.

bits() ->
    <<Foo/bitstring>> = gen_bitstring().


fully_qualified() ->
    <<Var/integer-signed-big-unit:8>>.


num_bits() ->
    <<Var:8/integer>>.


binary_comprehension() ->
    << <<I:8/integer>> || I <- lists:seq(1, 100) >>.
