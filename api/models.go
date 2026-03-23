package api

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Item කියන්නේ අපේ MongoDB Collection එකට ගැලපෙන Data Structure එක
type Item struct {
	// Mongoose වල auto හැදෙන _id එක Go වලදී මෙහෙම තමයි අල්ලගන්නේ
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	
	// enum: ['project', 'dataset', 'research']
	Type        string             `bson:"type" json:"type"`
	
	Title       string             `bson:"title" json:"title"`
	
	Description string             `bson:"description" json:"description"` // Markdown content
	
	// omitempty කියන්නේ මේක හිස් නම් DB එකට/JSON එකට යවන්න එපා කියන එකයි
	Link        string             `bson:"link,omitempty" json:"link,omitempty"`
	
	Tags        []string           `bson:"tags,omitempty" json:"tags,omitempty"`
	
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
}
