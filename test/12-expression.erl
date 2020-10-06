
if_expr() ->
    if
        foo -> bar;
        Condition -> 1;
        true -> ok
    end.

case_expr() ->
    case Thing of
        1 -> ok;
        true -> ok;
        _Else -> fail
    end.

recv_expr() ->
    receive
        Msg -> ok
    end,
    receive
        OtherMsg -> ok
    after 6000 ->
        timeout
    end.

named_fun_expr() ->
    fun local_fun/0,
    fun module:function/4.

anonymous_fun_expr1() ->
    fun(Arg) ->
        Arg + 2
    end.

anonymous_fun_expr2() ->
    fun
        (true) -> false;
        (false) -> true
    end.

try_expr1() ->
    try
        stuff()
    end.

try_expr2() ->
    try
        stuff()
    catch Type:Reason ->
        erlang:error({Type, Reason})
    end.

try_expr3() ->
    try
        stuff()
    catch _:_ ->
        failed
    after
        other_thing()
    end.

try_expr4() ->
    try
        stuff()
    after
        cleanup()
    end.

try_expr5() ->
    try stuff() of
        {ok, _} -> ok
    catch _T:_R ->
        failed
    end.

block_expr() ->
    begin
        do_stuff()
    end.