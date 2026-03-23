package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"

	// 🚨 ඔයාගේ go.mod එකේ තියෙන module නම සහ api ෆෝල්ඩර් එක තමයි මේ
	"portfolio-Website/api"
)

func main() {
	// 1. Local PC එකේදී .env එක කියවීම
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000" // Default port එක
	}

	// 2. Database එකට Connect වීම (api/db.go එකේ තියෙන function එක)
	api.ConnectDB()

	// 3. Router එක හදාගැනීම (Express වල app කියන එක වගේ)
	mux := http.NewServeMux()

	// 4. API Routes ටික Link කිරීම
	// /api/auth/ වලින් පටන් ගන්න ඒවා auth.go එකේ Handler එකට යවනවා
	mux.HandleFunc("/api/auth/", api.Handler)
	
	// /api/items වලින් පටන් ගන්න ඒවා routes.go එකේ RoutesHandler එකට යවනවා
	mux.HandleFunc("/api/items/", api.RoutesHandler)
	mux.HandleFunc("/api/items", api.RoutesHandler)

	// 5. Frontend එක (Static Files) Serve කිරීම
	distPath := filepath.Join(".", "dist")
	fs := http.FileServer(http.Dir(distPath))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// මේක API route එකක් නම්, හැබැයි උඩින් අල්ලගත්තේ නැත්නම් 404 යවනවා
		if strings.HasPrefix(r.URL.Path, "/api/") {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`{"error": "API Route Not Found"}`))
			return
		}

		// Frontend එකේ ෆයිල් තියෙනවද බලනවා (React/Vue/HTML)
		path := filepath.Join(distPath, r.URL.Path)
		if _, err := os.Stat(path); os.IsNotExist(err) {
			// ෆයිල් එකක් නැත්නම් index.html එකට යවනවා (SPA Routing)
			http.ServeFile(w, r, filepath.Join(distPath, "index.html"))
			return
		}
		fs.ServeHTTP(w, r)
	})

	// 6. සර්වර් එක Start කිරීම
	fmt.Printf("🚀 Go Server running successfully on http://localhost:%s\n", port)
	err := http.ListenAndServe("0.0.0.0:"+port, mux)
	if err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
