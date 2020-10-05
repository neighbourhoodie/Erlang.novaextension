% This collection covers all other module level
% attributes.

-include("foo.hrl").
-include_lib("app/include/app.hrl").

-vsn(1).

-else.

-compile(native).
-compile(export_all).

-my_attribute(my_value).
