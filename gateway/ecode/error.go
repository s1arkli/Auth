package ecode

var (
	ParamErr  = New(40001, "param error")
	SystemErr = New(50001, "system error")
)

type Error struct {
	code int
	msg  string
}

func (e *Error) Error() string {
	return e.msg
}

func (e *Error) Code() int {
	return e.code
}

func New(code int, msg string) Error {
	return Error{code, msg}
}
