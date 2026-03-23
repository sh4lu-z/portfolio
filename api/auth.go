package api

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// ඔයාගේ ඇත්තම Admin Secret එක මෙතන දාන්න
var myAdminSecret = []byte("sha2008@123")

// Vercel එකෙන් එන Request එක අල්ලගන්න ප්‍රධාන Handler එක
func Handler(w http.ResponseWriter, r *http.Request) {
	// CORS සහ JSON Headers සෙට් කිරීම
	w.Header().Set("Content-Type", "application/json")

	// URL Path එක අනුව අදාළ function එකට යොමු කිරීම (Mini-Router)
	if strings.HasSuffix(r.URL.Path, "/login") && r.Method == http.MethodPost {
		login(w, r)
		return
	}
	if strings.HasSuffix(r.URL.Path, "/logout") && r.Method == http.MethodPost {
		logout(w, r)
		return
	}
	if strings.HasSuffix(r.URL.Path, "/check") && r.Method == http.MethodGet {
		check(w, r)
		return
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Auth Route not found"})
}

// 1. Login Function එක
func login(w http.ResponseWriter, r *http.Request) {
	var reqBody struct {
		AdminKey string `json:"adminKey"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	if reqBody.AdminKey == string(myAdminSecret) {
		// JWT Token එක හැදීම
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"role": "admin",
			"exp":  time.Now().Add(24 * time.Hour).Unix(),
		})

		tokenString, err := token.SignedString(myAdminSecret)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate token"})
			return
		}

		// HttpOnly Cookie එක සෙට් කිරීම
		isProd := os.Getenv("VERCEL_ENV") == "production"
		http.SetCookie(w, &http.Cookie{
			Name:     "admin_token",
			Value:    tokenString,
			HttpOnly: true,
			Secure:   isProd,
			SameSite: http.SameSiteStrictMode,
			MaxAge:   24 * 60 * 60, // පැය 24යි
			Path:     "/",
		})

		json.NewEncoder(w).Encode(map[string]bool{"success": true})
	} else {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid Admin Key"})
	}
}

// 2. Logout Function එක
func logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "admin_token",
		Value:    "",
		HttpOnly: true,
		Secure:   os.Getenv("VERCEL_ENV") == "production",
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1, // Cookie එක මකා දැමීම
		Path:     "/",
	})
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// 3. Check Function එක (Token එක Valid ද කියලා බලන්න)
func check(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("admin_token")
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]bool{"authenticated": false})
		return
	}

	token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
		return myAdminSecret, nil
	})

	if err != nil || !token.Valid {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]bool{"authenticated": false})
		return
	}

	json.NewEncoder(w).Encode(map[string]bool{"authenticated": true})
}

// 4. Middleware එක (අනිත් API Routes ආරක්ෂා කරන්න)
func RequireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("admin_token")
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}

		token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
			return myAdminSecret, nil
		})

		if err != nil || !token.Valid {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}

		// Token එක හරි නම් විතරක් ඊළඟ function එකට යවනවා
		next.ServeHTTP(w, r)
	}
}
