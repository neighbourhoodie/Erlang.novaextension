% This is a comment.
%% Also a comment that ignores the second %
% More

-record(foo, {
    field = value % A comment
}).

% Function type argument
foo() ->
    % yay
    ok
