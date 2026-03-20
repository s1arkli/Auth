package auth

type (
	RegisterRequest struct {
		Account  string `json:"account"`
		Password string `json:"password"`
	}

	LoginRequest struct {
		Account  string `json:"account"`
		Password string `json:"password"`
	}
)
