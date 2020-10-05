-ifdef(TEST).
-include_lib("eunit/include/eunit.hrl").
-else.
-ifndef(NOT_TEST).
-include("something_else.hrl").
-endif.
-endif.

-undef(TEST).