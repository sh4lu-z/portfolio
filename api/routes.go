package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ඔයාගේ ඇත්තම Admin Secret එක (auth.go එකේ තිබ්බ එකමයි)
var secretKey = []byte("sha2008@123")

// Vercel එකෙන් Request එක ආවම රන් වෙන්නේ මේ Handler එකයි
func RoutesHandler(w http.ResponseWriter, r *http.Request) {
	// Database එකට Connect වීම (db.go එකේ තියෙන function එක)
	ConnectDB()

	w.Header().Set("Content-Type", "application/json")
	path := r.URL.Path

	// 1. GET /api/items/:type
	if r.Method == http.MethodGet && strings.Contains(path, "/items/") {
		parts := strings.Split(path, "/")
		itemType := parts[len(parts)-1] // URL එකේ අගම තියෙන කෑල්ල (type එක)

		getItems(w, itemType)
		return
	}

	// 2. POST /api/items
	if r.Method == http.MethodPost && strings.HasSuffix(path, "/items") {
		if !isAdmin(r) {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}
		createItem(w, r)
		return
	}

	// 3. DELETE /api/items/:id
	if r.Method == http.MethodDelete && strings.Contains(path, "/items/") {
		if !isAdmin(r) {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized"})
			return
		}

		parts := strings.Split(path, "/")
		id := parts[len(parts)-1] // URL එකේ අගම තියෙන කෑල්ල (id එක)
		deleteItem(w, id)
		return
	}

	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(map[string]string{"error": "Route not found"})
}

// ---------------- Helper Functions ---------------- //

func getItems(w http.ResponseWriter, itemType string) {
	collection := DB.Collection("items") // ඔයාගේ MongoDB Collection එකේ නම
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// createdAt අනුව අලුත්ම ඒවා උඩට එන්න Sort කිරීම
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	
	cursor, err := collection.Find(ctx, bson.M{"type": itemType}, opts)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Server Error"})
		return
	}
	defer cursor.Close(ctx)

	var items []Item
	if err = cursor.All(ctx, &items); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// items මොකුත් නැත්නම් null වෙනුවට හිස් array එකක් යවන්න
	if items == nil {
		items = []Item{}
	}
	json.NewEncoder(w).Encode(items)
}

func createItem(w http.ResponseWriter, r *http.Request) {
	// Frontend එකෙන් එන JSON එක අල්ලගන්න Structure එක
	var reqBody struct {
		Type        string `json:"type"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Link        string `json:"link"`
		Tags        string `json:"tags"` // Comma වලින් වෙන් කරපු String එකක් විදිහට එනවා කියලයි හිතන්නේ
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid JSON payload"})
		return
	}

	if reqBody.Type == "" || reqBody.Title == "" || reqBody.Description == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Type, title, and description are required."})
		return
	}

	// Tags ටික වෙන් කරගැනීම (Split by comma)
	var tagsArray []string
	if reqBody.Tags != "" {
		for _, t := range strings.Split(reqBody.Tags, ",") {
			tagsArray = append(tagsArray, strings.TrimSpace(t))
		}
	} else {
		tagsArray = []string{}
	}

	// අලුත් Item එක හැදීම (models.go එකේ තියෙන Struct එක පාවිච්චි කරලා)
	newItem := Item{
		ID:          primitive.NewObjectID(),
		Type:        reqBody.Type,
		Title:       reqBody.Title,
		Description: reqBody.Description,
		Link:        reqBody.Link,
		Tags:        tagsArray,
		CreatedAt:   time.Now(),
	}

	collection := DB.Collection("items")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := collection.InsertOne(ctx, newItem)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to save item"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newItem)
}

func deleteItem(w http.ResponseWriter, id string) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid ID format"})
		return
	}

	collection := DB.Collection("items")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Server Error"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Item deleted"})
}

// Token එක හරිද කියලා බලන Helper Function එක
func isAdmin(r *http.Request) bool {
	cookie, err := r.Cookie("admin_token")
	if err != nil {
		return false
	}

	token, err := jwt.Parse(cookie.Value, func(t *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	return err == nil && token.Valid
}
